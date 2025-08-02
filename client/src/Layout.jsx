import { Outlet, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import axios from "axios";

import { useState, useRef, useEffect } from "react";

function getDeviceId() {
	let id = localStorage.getItem("deviceId");
	if (!id) {
		id = crypto.randomUUID();
		localStorage.setItem("deviceId", id);
	}
	return id;
}

export default function Layout() {
	const location = useLocation();

	const [editMode, setEditMode] = useState(false);
	const [isProjectPublished, setIsProjectPublished] = useState(null);

	const saveHomePageInfoRef = useRef(null);
	const saveAboutPageInfoRef = useRef(null);
	const saveContactPageInfoAndDetailsRef = useRef(null);
	const createNewProjectRef = useRef(null);
	const moveToDraftRef = useRef(null);
	const moveToPublishedRef = useRef(null);
	const saveProjectRef = useRef(null);

	const deleteProjectRef = useRef(null);

	useEffect(() => {
		const deviceId = getDeviceId();
		axios
			.post("/track", {
				deviceId,
				path: location.pathname,
				timestamp: new Date().toISOString(),
			})
			.catch(() => {});
	}, [location.pathname]);

	function handleToggleEditMode() {
		setEditMode((prev) => !prev);
	}

	return (
		<div className="min-h-screen flex flex-col">
			<Header
				isProjectPublished={isProjectPublished}
				toggleEditMode={handleToggleEditMode}
				editMode={editMode}
				onHomePageInfoSave={() => saveHomePageInfoRef.current?.()}
				onAboutPageInfoSave={() => saveAboutPageInfoRef.current?.()}
				onContactPageInfoAndDetailsSave={() =>
					saveContactPageInfoAndDetailsRef.current?.()
				}
				onCreateNewProject={() => {
					createNewProjectRef.current?.();
				}}
				onMoveToDraft={() => {
					moveToDraftRef.current?.();
				}}
				onMoveToPublished={() => {
					moveToPublishedRef.current?.();
				}}
				onSaveProject={() => {
					saveProjectRef.current?.();
				}}
				onDeleteProject={() => {
					deleteProjectRef.current?.();
				}}
			/>

			{/* Main content */}
			<div className="flex-grow mb-10">
				<Outlet
					context={{
						editMode,
						setIsProjectPublished,
						setSaveHomePageInfoHandler: (fn) =>
							(saveHomePageInfoRef.current = fn),
						setSaveAboutPageInfoHandler: (fn) =>
							(saveAboutPageInfoRef.current = fn),
						setSaveContactPageInfoAndDetailsHandler: (fn) =>
							(saveContactPageInfoAndDetailsRef.current = fn),
						setCreateNewProjectHandler: (fn) =>
							(createNewProjectRef.current = fn),
						setMoveToDraftHandler: (fn) => (moveToDraftRef.current = fn),
						setMoveToPublishedHandler: (fn) =>
							(moveToPublishedRef.current = fn),
						setSaveProjectHandler: (fn) => (saveProjectRef.current = fn),
						setDeleteProjectHandler: (fn) => (deleteProjectRef.current = fn),
					}}
				/>
			</div>

			<Footer />
		</div>
	);
}
