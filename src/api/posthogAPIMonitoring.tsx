import posthog from 'posthog-js'

export const TrackResponse = (response : any, endpoint : string, reqObject : any) => {
    //track successful response
    posthog.capture('api_response', {
        status: response.status,
        endpoint: endpoint,
        request : reqObject
      });
}