import "./App.css";
import { Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import { UserContextProvider } from "./UserContext";

import IndexPage from "./pages/IndexPage";
import ProjectEditorPage from "./pages/ProjectEditorPage";
import ProjectsPage from "./pages/ProjectsPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import LoginPage from "./pages/LoginPage";

import Test from "./pages/test";

import { Toaster } from "sonner";
import axios from "axios";

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;
axios.defaults.withCredentials = true;

function App() {
	return (
		<>
			<Toaster richColors position="bottom-center" />
			<UserContextProvider>
				<Routes>
					<Route path="/" element={<Layout />}>
						{/* Public Routes */}
						<Route index element={<IndexPage />} />
						<Route path="/projects" element={<ProjectsPage />} />
						<Route path="/projects/:id" element={<ProjectEditorPage />} />

						<Route path="/about" element={<AboutPage />} />
						<Route path="/contact" element={<ContactPage />} />

						<Route path="/login" element={<LoginPage />} />

						{/*Testing */}
						<Route path="/three" element={<Test />} />
					</Route>
				</Routes>
			</UserContextProvider>
		</>
	);
}

export default App;
