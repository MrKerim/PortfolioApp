import { useEffect, useState } from "react";
import { Link, useOutletContext, useNavigate } from "react-router-dom";

import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import axios from "axios";

import { toast } from "sonner";

export default function UserProjectsPage() {
	const [projects, setProjects] = useState([]);
	const [projectsDraft, setProjectsDraft] = useState([]);
	const { setCreateNewProjectHandler } = useOutletContext();

	const navigate = useNavigate();

	useEffect(() => {
		setCreateNewProjectHandler(createNewProjectHandler);
	}, []);

	useEffect(() => {
		axios.get("/projects").then((res) => {
			setProjects(res.data);
		});

		axios.get("/projectsDraft").then((res) => {
			setProjectsDraft(res.data);
		});
	}, []);

	async function createNewProjectHandler() {
		const promise = axios.post("/projects");

		toast.promise(promise, {
			loading: "Yeni proje oluşturuluyor...",
			success: "Başarıyla oluşturuldu!",
			error: (err) => {
				if (err.response?.data?.message) {
					return `Hata: ${err.response.data.message}`;
				}
				return "Bir hata oluştu.";
			},
		});

		promise.then((res) => {
			const projectId = res.data.id;
			navigate(`/projects/${projectId}`);
		});
	}

	return (
		<div className="mt-14 w-full flex justify-center">
			<div className="mx-8 w-full md:w-3xl lg:w-5xl">
				<h1 className="ml-10 text-4xl font-bold">Paylaşılmış</h1>
				<div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
					{projects.map((project) => (
						<Link
							to={"/projects/" + project.id}
							key={project.id}
							className="flex flex-col gap-4 m-6 cursor-pointer p-6 justify-between glass rounded-2xl lg:text-2xl text-lg font-bold duration-200 ease-in text-[#606060] hover:text-black"
						>
							<h1 className="line-clamp-2">{project.title}</h1>
							<img
								className="rounded-2xl shadow-2xl opacity-75 hover:opacity-100 duration-200 ease-in"
								src={project.coverImage}
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

				<h1 className="ml-10 mt-24 text-4xl font-bold">Taslak</h1>
				<div className="ml-10 mt-2 border-gray-400 pl-4 border-l-2">
					<h1 className=" font-light text-gray-500 ">
						Taslak durumundaki projeleri sadece siz görebilirsiniz.
					</h1>
					<h1 className="font-light text-gray-500 ">
						İstediğiniz zaman taslağınızı kaydedebilir yada paylaşabilirsiniz.
					</h1>
					<h1 className="font-light text-gray-500 ">
						Oluşturduğunuz yeni projeler buraya düşer.
					</h1>
				</div>

				<div className="grid mt-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
					{projectsDraft.map((project) => (
						<Link
							to={"/projects/" + project.id}
							key={project.id}
							className="flex flex-col gap-4 m-6 cursor-pointer p-6 justify-between glass rounded-2xl lg:text-2xl text-lg font-bold duration-200 ease-in text-[#606060] hover:text-black"
						>
							<h1 className="line-clamp-2">{project.title}</h1>
							<img
								className="rounded-2xl shadow-2xl opacity-75 hover:opacity-100 duration-200 ease-in"
								src={project.coverImage}
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
