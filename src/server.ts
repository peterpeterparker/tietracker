import type {ExportedHandler} from 'kyushu-types';

export default {
  async fetch(request, env) {
    const fetchWithSpaFallback = async () => {
      const {url: requestUrl} = request;

      const url = URL.parse(requestUrl);

      if (url === null) {
        return {status: 400, body: 'Bad Request'};
      }

      const {pathname} = url;

      const hasNoExtension = !pathname.split('/').pop()?.includes('.');
      const endsWithSlash = pathname.endsWith('/');

      // SPA - Ionic React somehow does not generate a multi-page app anymore
      if (hasNoExtension || endsWithSlash) {
        // Imperative for simplicity and perf reasons
        url.pathname = '/';

        return await env.ASSETS.fetch({
          ...request,
          url: url.toString(),
        });
      }

      return await env.ASSETS.fetch(request);
    };

    return await fetchWithSpaFallback();
  },
} satisfies ExportedHandler;
