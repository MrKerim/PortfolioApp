import { createContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import axios from "axios";
export const UserContext = createContext({});

export function UserContextProvider({ children }) {
	const [user, setUser] = useState(null);
	const [ready, setReady] = useState(false);
	const location = useLocation();

	useEffect(() => {
		if (!user) {
			axios.get("/profile").then(({ data }) => {
				setUser(data);
				setReady(true);
			});
		}
	}, []);

	useEffect(() => {
		window.scrollTo(0, 0);
	}, [location]);

	return (
		<UserContext.Provider value={{ user, setUser, ready }}>
			{children}
		</UserContext.Provider>
	);
}
