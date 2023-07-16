"use strict";

// https://github.com/jaydenseric/apollo-upload-client

import {ApolloLink, Observable} from './ApolloClient.js';//'apollo';
import {
    createSignalIfSupported,
    fallbackHttpConfig,
    parseAndCheckHttpResponse,
    rewriteURIForGET,
    selectHttpOptionsAndBody,
    selectURI,
    serializeFetchParameter,
  } from '@apollo/client/link/http';//'aclh';
import {extractFiles} from './extractFiles.js';
function formDataAppendFile(formData, fieldName, file) {
  formData.append(fieldName, file, file.name);
};
function isExtractableFile(value) {
  return (
    (typeof File !== "undefined" && value instanceof File) ||
    (typeof Blob !== "undefined" && value instanceof Blob)
  );
}


export function createUploadLink({
  uri: fetchUri = "/graphql",
  useGETForQueries,
  isExtractableFile: customIsExtractableFile = isExtractableFile,
  FormData: CustomFormData,
  formDataAppendFile: customFormDataAppendFile = formDataAppendFile,
  fetch: customFetch,
  fetchOptions,
  credentials,
  headers,
  includeExtensions,
} = {}) {
  const linkConfig = {
    http: { includeExtensions },
    options: fetchOptions,
    credentials,
    headers,
  };

  return new ApolloLink((operation) => {
    const context = operation.getContext();
    const {
      // Apollo Studio client awareness `name` and `version` can be configured
      // via `ApolloClient` constructor options:
      // https://apollographql.com/docs/studio/client-awareness/#using-apollo-server-and-apollo-client
      clientAwareness: { name, version } = {},
      headers,
    } = context;

    const contextConfig = {
      http: context.http,
      options: context.fetchOptions,
      credentials: context.credentials,
      headers: {
        // Client awareness headers can be overridden by context `headers`.
        ...(name && { "apollographql-client-name": name }),
        ...(version && { "apollographql-client-version": version }),
        ...headers,
      },
    };

    const { options, body } = selectHttpOptionsAndBody(
      operation,
      fallbackHttpConfig,
      linkConfig,
      contextConfig
    );

    //const { clone, files } = extractFiles(body, "", customIsExtractableFile); //isExtractableFile
    const { clone, files } = extractFiles(body, isExtractableFile, "");

    let uri = selectURI(operation, fetchUri);

    if (files.size) {
      // Automatically set by `fetch` when the `body` is a `FormData` instance.
      delete options.headers["content-type"];

      // GraphQL multipart request spec:
      // https://github.com/jaydenseric/graphql-multipart-request-spec

      const RuntimeFormData = CustomFormData || FormData;

      const form = new RuntimeFormData();

      form.append("operations", serializeFetchParameter(clone, "Payload"));

      const map = {};
      let i = 0;
      files.forEach((paths) => {
        map[++i] = paths;
      });
      form.append("map", JSON.stringify(map));

      i = 0;
      files.forEach((paths, file) => {
        customFormDataAppendFile(form, ++i, file);
      });

      options.body = form;
    } else {
      if (
        useGETForQueries &&
        // If the operation contains some mutations GET shouldn’t be used.
        !operation.query.definitions.some(
          (definition) =>
            definition.kind === "OperationDefinition" &&
            definition.operation === "mutation"
        )
      )
        options.method = "GET";

      if (options.method === "GET") {
        const { newURI, parseError } = rewriteURIForGET(uri, body);
        if (parseError)
          // Apollo’s `HttpLink` uses `fromError` for this, but it’s not
          // exported from `@apollo/client/link/http`.
          return new Observable((observer) => {
            observer.error(parseError);
          });
        uri = newURI;
      } else options.body = serializeFetchParameter(clone, "Payload");
    }

    const { controller } = createSignalIfSupported();

    if (controller) {
      if (options.signal)
        // Respect the user configured abort controller signal.
        options.signal.aborted
          ? // Signal already aborted, so immediately abort.
            controller.abort()
          : // Signal not already aborted, so setup a listener to abort when it
            // does.
            options.signal.addEventListener(
              "abort",
              () => {
                controller.abort();
              },
              {
                // Prevent a memory leak if the user configured abort controller
                // is long lasting, or controls multiple things.
                once: true,
              }
            );

      options.signal = controller.signal;
    }

    const runtimeFetch = customFetch || fetch;

    return new Observable((observer) => {
      // Used to track if the observable is being cleaned up.
      let cleaningUp;

      runtimeFetch(uri, options)
        .then((response) => {
          // Forward the response on the context.
          operation.setContext({ response });
          return response;
        })
        .then(parseAndCheckHttpResponse(operation))
        .then((result) => {
          observer.next(result);
          observer.complete();
        })
        .catch((error) => {
          // If the observable is being cleaned up, there is no need to call
          // next or error because there are no more subscribers. An error after
          // cleanup begins is likely from the cleanup function aborting the
          // fetch.
          if (!cleaningUp) {
            // For errors such as an invalid fetch URI there will be no GraphQL
            // result with errors or data to forward.
            if (error.result && error.result.errors && error.result.data)
              observer.next(error.result);

            observer.error(error);
          }
        });

      // Cleanup function.
      return () => {
        cleaningUp = true;

        // Abort fetch. It’s ok to signal an abort even when not fetching.
        if (controller) controller.abort();
      };
    });
  });
};