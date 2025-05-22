import { AppDispatch } from "@/store/store";
import { setEvents, setEventsError } from "./eventsSlice";

export const handleEventSocketMessages = (data: any, dispatch: AppDispatch) => {
    switch(data.type){
        case 'EVENTS_LIST':
            dispatch(setEvents(data.payload));
            break;
        case 'EVENTS_ERROR':
            dispatch(setEventsError(data.payload));
            break;

        default:
            console.warn('Unhandled event message type:', data.type);
    }
};