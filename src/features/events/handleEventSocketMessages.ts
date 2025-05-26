import { AppDispatch } from "@/store/store";
import { setEvents, setEventsError, setEventDetails } from "./eventsSlice";

export const handleEventSocketMessages = (data: any, dispatch: AppDispatch) => {
  switch (data.type) {
    case 'EVENTS_LIST':
      dispatch(setEvents(data.payload));
      break;
    case 'EVENT_DETAILS_DATA':
      dispatch(setEventDetails(data.payload));
      break;
    case 'EVENTS_ERROR':
      dispatch(setEventsError(data.payload));
      break;
    default:
      console.warn('[WebSocket] Unhandled event message type:', data.type);
  }
};
