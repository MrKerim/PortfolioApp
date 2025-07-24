import { useEffect, useContext, useState } from "react";
import { UserContext } from "../UserContext";

import UserProjectsPage from "./userControl/UserProjectsPage";

import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import axios from "axios";
import { Link } from "react-router-dom";

export default function ProjectsPage() {
	const { ready, user, setUser } = useContext(UserContext);
	const [projects, setProjects] = useState([]);

	useEffect(() => {
		axios.get("/projects").then((res) => {
			setProjects(res.data);
		});
	}, []);

	if (user) {
		return <UserProjectsPage />;
	}

	return (
		<div className="mt-14 w-full flex justify-center">
			<div className="mx-8 w-full md:w-3xl lg:w-5xl">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
					{projects.map((project) => (
						<Link
							to={"/projects/" + project.id}
							key={project.id}
							className="flex flex-col gap-4 m-6 cursor-pointer p-6 justify-between glass rounded-2xl lg:text-2xl text-lg font-bold duration-200 ease-in text-[#606060] hover:text-black"
						>
							<h1 className="line-clamp-2">{project.title}</h1>
							<img
								className="rounded-2xl shadow-2xl opacity-75 hover:opacity-100 duration-200 ease-in"
								src={"http://localhost:4000/" + project.coverImage}
								alt={project.title}
								style={{
									height: 250,
									width: "auto", // optional, keep aspect ratio
									objectFit: "cover", // crop to fill height
								}}
							/>
						</Link>
					))}
				</div>
			</div>
		</div>
	);
}
