import instance from "../api/axiosConfig"
import { AxiosError } from "axios";

export type Response = {
    status: string;
    code: number;
    total: number;
    data: {
        results: Person[];
    }
}

export type Person = {
    email: string,
    name :{
        title: string,
        first: string,
        last: string,
    },
    id: {
        name: string;
        value: string
    },
    picture: {
        large: string;
        medium: string;
    }
}

type ErrorResponse = {
    message: string;
}

export const fetchPersons = async () => {
    try {
        const response: Response = await instance.get('/?results=7');
        return response;
    } catch (error) {
        const axiosError = AxiosError<ErrorResponse>;
        console.log(axiosError);
    }
}