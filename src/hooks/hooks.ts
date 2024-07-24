import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../store/store";

/**Use throughout the application instead of plain `useDispatch` and `useSelector` */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();