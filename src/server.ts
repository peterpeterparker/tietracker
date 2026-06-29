import type {ExportedHandler} from 'kyushu-types';

export default {
  async fetch(request, env) {
    const response = await env.ASSETS?.fetch(request);

    if (response === undefined) {
      return {status: 500, body: 'Internal Server Error'};
    }

    return response;
  },
} satisfies ExportedHandler;
