import { useState, useEffect, useContext } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { UserContext } from "../UserContext";
import axios from "axios";
import { toast } from "sonner";

import ConfirmationDialog from "./ConfirmationDialog";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

export default function Header({
	toggleEditMode,
	editMode,
	onHomePageInfoSave,
	onAboutPageInfoSave,
	onContactPageInfoAndDetailsSave,
	onCreateNewProject,
	isProjectPublished,
	onMoveToDraft,
	onMoveToPublished,
	onSaveProject,
	onDeleteProject,
}) {
	const [
		moveToDraftConfirmationDialogOpen,
		setMoveToDraftConfirmationDialogOpen,
	] = useState(false);

	const [
		moveToPublishedConfirmationDialogOpen,
		setMoveToPublishedConfirmationDialogOpen,
	] = useState(false);

	const [
		deleteProjectConfirmationDialogOpen,
		setDeleteProjectConfirmationDialogOpen,
	] = useState(false);

	const [isBurgerMenuOn, setBurgerMenu] = useState(false);
	const { ready, user, setUser } = useContext(UserContext);

	const navigate = useNavigate();

	const { id } = useParams();

	const location = useLocation();
	const isActive = (path) => location.pathname == path;
	const higlightNav = (path) =>
		isActive(path) ? " text-white bg-[#242424] " : " text-[#606060] ";

	useEffect(() => {
		setBurgerMenu(false);
	}, [location]);

	async function handleLogout() {
		await axios.post("/logout");
		setUser(null);
		navigate("/");
	}

	return (
		<div className="z-10">
			<div className="flex justify-center w-full fixed">
				<div className="hidden sm:flex mt-6 mb-10 glass rounded-4xl justify-between  md:gap-3 gap-1 md:text-md sm:text-sm text-xs font-bold">
					<Link
						to={editMode ? "#" : "/"}
						className={
							" md:px-8 md:py-2 px-4 py-1 rounded-4xl " +
							higlightNav("/") +
							(editMode ? " cursor-not-allowed" : " ")
						}
					>
						Anasayfa
					</Link>
					<Link
						to={editMode ? "#" : "/projects"}
						className={
							" md:px-8 md:py-2 px-4 py-1 rounded-4xl " +
							higlightNav("/projects") +
							(editMode ? " cursor-not-allowed" : " ")
						}
					>
						Projelerim
					</Link>
					<Link
						to={editMode ? "#" : "/about"}
						className={
							" md:px-8 md:py-2 px-4 py-1 rounded-4xl " +
							higlightNav("/about") +
							(editMode ? " cursor-not-allowed" : " ")
						}
					>
						Hakkımda
					</Link>
					<Link
						to={editMode ? "#" : "contact"}
						className={
							"md:px-8 md:py-2 px-4 py-1 rounded-4xl" +
							higlightNav("/contact") +
							(editMode ? " cursor-not-allowed" : " ")
						}
					>
						İletişim
					</Link>
				</div>
				{user && (
					<>
						<ConfirmationDialog
							open={moveToDraftConfirmationDialogOpen}
							setOpen={setMoveToDraftConfirmationDialogOpen}
							onAccept={onMoveToDraft}
							onCancel={() => {}}
							title="Taslaklara taşı"
							description="Bu proje yayımlanmıştır, projeyi taslaklara taşımak istediğinize eminmisiniz?"
						/>

						<ConfirmationDialog
							open={moveToPublishedConfirmationDialogOpen}
							setOpen={setMoveToPublishedConfirmationDialogOpen}
							onAccept={onMoveToPublished}
							onCancel={() => {}}
							title="Projeyi yayımla"
							description="Projeyi yayımladığınızda herkes okuyabilir hale gelecek, merak etmeyin bu işemi geri alabilirsini."
						/>

						<ConfirmationDialog
							open={deleteProjectConfirmationDialogOpen}
							setOpen={setDeleteProjectConfirmationDialogOpen}
							onAccept={onDeleteProject}
							onCancel={() => {}}
							title="Projeyi silmek istediğinizden emin misiniz?"
							description="Projeyi silmek üzeresiniz, unutmayın bu işlem asla geri alınamaz. Eğer sadece yayımdan kaldırmak istiyorsanız taslaklara taşımayı deneyin."
						/>

						<DropdownMenu.Root>
							<DropdownMenu.Trigger
								className={
									editMode ? "pointer-events-none cursor-not-allowed" : ""
								}
								asChild
							>
								<div className=" cursor-pointer ml-4 px-1 md:px-2 items-center  justify-center hidden sm:flex mt-6 mb-10 glass rounded-4xl d:text-md sm:text-sm text-xs font-bold duration-200 ease-in text-[#606060] hover:text-black">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="22"
										height="22"
										fill="currentColor"
										className="bi bi-person-fill"
										viewBox="0 0 16 16"
									>
										<path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6" />
									</svg>
								</div>
							</DropdownMenu.Trigger>
							<DropdownMenu.Content
								sideOffset={5}
								className="bg-white border-gray-300 rounded-lg shadow p-2 "
							>
								<DropdownMenu.Item
									className="cursor-pointer outline-none focus:outline-none"
									onClick={() => console.log("Settings")}
								>
									<h1 className="flex items-center gap-2 py-1 px-2 rounded-lg duration-200 ease-in hover:bg-gray-400 hover:text-white ">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="16"
											height="16"
											fill="currentColor"
											className="bi bi-gear"
											viewBox="0 0 16 16"
										>
											<path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492M5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0" />
											<path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115z" />
										</svg>{" "}
										Ayarlar
									</h1>
								</DropdownMenu.Item>
								<DropdownMenu.Item
									className="cursor-pointer mt-2 outline-none focus:outline-none"
									onSelect={() => handleLogout()}
								>
									<h1 className="flex items-center gap-1 duration-200  ease-in bg-red-500 text-white py-1 px-3 rounded-lg hover:bg-red-300 hover:text-black">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="16"
											height="16"
											fill="currentColor"
											className="bi bi-box-arrow-right"
											viewBox="0 0 16 16"
										>
											<path
												fillRule="evenodd"
												d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"
											/>
											<path
												fillRule="evenodd"
												d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"
											/>
										</svg>
										Çıkış
									</h1>
								</DropdownMenu.Item>
							</DropdownMenu.Content>
						</DropdownMenu.Root>
						{!editMode ? (
							<DropdownMenu.Root>
								<DropdownMenu.Trigger asChild>
									<div className=" cursor-pointer ml-4 w-8 h-8 md:w-10 md:h-10 items-center  justify-center hidden sm:flex mt-6 mb-10 glass rounded-4xl d:text-md sm:text-sm text-xs font-bold duration-200 ease-in text-[#606060] hover:text-black">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="16"
											height="16"
											fill="currentColor"
											className="bi bi-pencil-fill"
											viewBox="0 0 16 16"
										>
											<path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z" />
										</svg>
									</div>
								</DropdownMenu.Trigger>
								<DropdownMenu.Content
									sideOffset={5}
									className="bg-white border-gray-300 rounded-lg shadow p-2 "
								>
									<DropdownMenu.Item
										className="cursor-pointer outline-none focus:outline-none"
										onClick={() => {
											toggleEditMode();
											toast.info("Düzenleme modundasınız, bir yazıya tıklayın");
										}}
									>
										<h1 className="flex items-center gap-2 py-1 px-2 rounded-lg duration-200 ease-in hover:bg-gray-400 hover:text-white ">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												width="16"
												height="16"
												fill="currentColor"
												className="bi bi-pencil-fill"
												viewBox="0 0 16 16"
											>
												<path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z" />
											</svg>{" "}
											Düzenle
										</h1>
									</DropdownMenu.Item>

									{!!id && (
										<DropdownMenu.Item
											className="cursor-pointer mt-2 outline-none focus:outline-none"
											onSelect={() => {
												setDeleteProjectConfirmationDialogOpen(true);
											}}
										>
											<h1 className="flex items-center gap-1 duration-200  ease-in bg-red-500 text-white py-1 px-3 rounded-lg hover:bg-red-300 hover:text-black">
												<svg
													xmlns="http://www.w3.org/2000/svg"
													width="16"
													height="16"
													fill="currentColor"
													className="bi bi-trash3"
													viewBox="0 0 16 16"
												>
													<path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5" />
												</svg>
												Sil
											</h1>
										</DropdownMenu.Item>
									)}
								</DropdownMenu.Content>
							</DropdownMenu.Root>
						) : (
							<div className=" cursor-pointer  ml-4 items-center  justify-center hidden sm:flex mt-6 mb-10 glass rounded-4xl d:text-md sm:text-sm text-xs font-bold duration-200 ease-in text-black ">
								<div
									onClick={() => {
										toggleEditMode();
										toast.warning("Düzenleme iptal edildi");
									}}
									className="hover-x duration-200 ease-in p-2 rounded-full hover:bg-red-500 hover:text-white"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="16"
										height="16"
										fill="currentColor"
										className="bi bi-x-lg"
										viewBox="0 0 16 16"
									>
										<path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
									</svg>
								</div>
								<div
									onClick={() => {
										toggleEditMode();
										if (isActive("/")) onHomePageInfoSave();
										else if (isActive("/about")) onAboutPageInfoSave();
										else if (isActive("/contact"))
											onContactPageInfoAndDetailsSave();
										else if (!!id) onSaveProject();
									}}
									className="hover-check duration-200 ease-in  p-2 rounded-full bg-green-300 hover:bg-green-500  hover:text-white"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="16"
										height="16"
										fill="currentColor"
										className="bi bi-check-lg"
										viewBox="0 0 16 16"
									>
										<path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z" />
									</svg>
								</div>
							</div>
						)}

						{isActive("/projects") && (
							<div
								title="Yeni proje ekle"
								onClick={onCreateNewProject}
								className={
									" cursor-pointer ml-4 w-8 h-8 md:w-10 md:h-10 items-center  justify-center hidden sm:flex mt-6 mb-10  rounded-4xl d:text-md sm:text-sm text-xs font-bold duration-200 ease-in bg-green-300 hover:bg-green-500  hover:text-white " +
									(editMode ? "pointer-events-none cursor-not-allowed" : "")
								}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="24"
									height="24"
									fill="currentColor"
									className="bi bi-plus"
									viewBox="0 0 16 16"
								>
									<path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
								</svg>
							</div>
						)}

						{!!id && !isProjectPublished && (
							<div
								title="Yayımla"
								onClick={() => {
									setMoveToPublishedConfirmationDialogOpen(true);
								}}
								className={
									"ml-4 w-8 h-8 md:w-10 md:h-10 items-center  justify-center hidden sm:flex mt-6 mb-10  rounded-4xl d:text-md sm:text-sm text-xs font-bold duration-200 ease-in bg-green-300 hover:bg-green-500  hover:text-white" +
									(editMode
										? " pointer-events-none cursor-not-allowed"
										: " cursor-pointer ")
								}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="16"
									height="16"
									fill="currentColor"
									className="bi bi-send"
									viewBox="0 0 16 16"
								>
									<path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576zm6.787-8.201L1.591 6.602l4.339 2.76z" />
								</svg>
							</div>
						)}
						{!!id && isProjectPublished && (
							<div
								title="Taslaklara taşı"
								onClick={() => {
									setMoveToDraftConfirmationDialogOpen(true);
								}}
								className={
									"  ml-4 w-8 h-8 md:w-10 md:h-10 items-center  justify-center hidden sm:flex mt-6 mb-10  rounded-4xl d:text-md sm:text-sm text-xs font-bold duration-200 ease-in bg-amber-200 hover:bg-amber-500  hover:text-white" +
									(editMode
										? " pointer-events-none cursor-not-allowed"
										: " cursor-pointer")
								}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="16"
									height="16"
									fill="currentColor"
									className="bi bi-paperclip"
									viewBox="0 0 16 16"
								>
									<path d="M4.5 3a2.5 2.5 0 0 1 5 0v9a1.5 1.5 0 0 1-3 0V5a.5.5 0 0 1 1 0v7a.5.5 0 0 0 1 0V3a1.5 1.5 0 1 0-3 0v9a2.5 2.5 0 0 0 5 0V5a.5.5 0 0 1 1 0v7a3.5 3.5 0 1 1-7 0z" />
								</svg>
							</div>
						)}
					</>
				)}
				<div
					onClick={() => {
						setBurgerMenu(true);
					}}
					className={
						" absolute justify-between w-full" +
						(isBurgerMenuOn ? " hidden" : " flex sm:hidden")
					}
				>
					<div></div>
					<div className="glass rounded-4xl px-2 py-1 mr-12 mt-10 ">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="22"
							height="22"
							fill="currentColor"
							viewBox="0 0 16 16"
						>
							<path
								fillRule="evenodd"
								d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"
							/>
						</svg>
					</div>
				</div>
				<div
					className={
						" absolute flex justify-between w-full  transition-opacity duration-1000 " +
						(isBurgerMenuOn
							? "opacity-100 sm:hidden  "
							: " opacity-0 pointer-events-none ")
					}
				>
					<div></div>
					<div
						onClick={() => {
							setBurgerMenu(false);
						}}
						className="glass rounded-4xl px-2 mr-12 mt-10 font-bold text-2xl"
					>
						X
					</div>
				</div>

				<div
					className={
						"fixed  w-300 h-300 -top-100 -z-20 rounded-full backdrop-blur-sm bg-gray-100/80 transition-transform duration-1000 origin-top-right transform " +
						(isBurgerMenuOn ? "scale-125" : "  scale-0")
					}
				/>

				<div
					className={
						"flex flex-col mt-6 mb-10 sm:hidden  rounded-4xl justify-between  text-xl font-bold transition-opacity duration-700 " +
						(isBurgerMenuOn
							? " opacity-100 "
							: " opacity-0 pointer-events-none hidden")
					}
				>
					<Link
						to={editMode ? "#" : "/"}
						className={
							"glass  px-10 py-4  mt-24 rounded-4xl" + higlightNav("/")
						}
					>
						Anasayfa
					</Link>
					<Link
						to={"/projects"}
						className={
							" glass px-10 py-4 mt-6 rounded-4xl" + higlightNav("/projects")
						}
					>
						Projelerim
					</Link>
					<Link
						to={editMode ? "#" : "/about"}
						className={
							" glass px-10 py-4 mt-6  rounded-4xl" + higlightNav("/about")
						}
					>
						Hakkımda
					</Link>
					<Link
						to={editMode ? "#" : "/contact"}
						className={
							"glass px-10 py-4 mt-6 rounded-4xl" + higlightNav("/contact")
						}
					>
						İletişim
					</Link>
					{user && (
						<>
							<Link to={"/"} className={"glass px-10 py-4 mt-6 rounded-4xl"}>
								<h1 className="flex items-center gap-2 text-[#606060]">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="16"
										height="16"
										fill="currentColor"
										className="bi bi-gear"
										viewBox="0 0 16 16"
									>
										<path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492M5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0" />
										<path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115z" />
									</svg>{" "}
									Ayarlar
								</h1>
							</Link>
							<div
								onClick={() => handleLogout()}
								className={"glass bg-red-500 px-10 py-4 mt-6 rounded-4xl"}
							>
								<h1 className="flex items-center gap-1 text-white ">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="16"
										height="16"
										fill="currentColor"
										className="bi bi-box-arrow-right"
										viewBox="0 0 16 16"
									>
										<path
											fillRule="evenodd"
											d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"
										/>
										<path
											fillRule="evenodd"
											d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"
										/>
									</svg>
									Çıkış
								</h1>
							</div>
						</>
					)}
				</div>
			</div>
			<div className="mb-24"></div>
		</div>
	);
}
