import { useContext, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../UserContext.jsx";

export default function LoginPage() {
	const [pendingRequest, setPendingRequest] = useState(false);

	const [togglePasswordVisibility, setTogglePasswordVisibility] =
		useState(false);
	const [forgotPassword, setForgotPassword] = useState(false);
	const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");

	const [emailNotFound, setEmailNotFound] = useState(false);
	const [wrongPassword, setWrongPassword] = useState(false);

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [redirectToHome, setRedirectToHome] = useState(false);

	const { user, setUser } = useContext(UserContext);

	if (user) {
		return <Navigate to={"/"} />;
	}

	async function handleLoginRequest(ev) {
		ev.preventDefault();
		setPendingRequest(true);
		try {
			const response = await axios.post("/login", {
				email,
				password,
			});
			setUser(response.data);
			setRedirectToHome("/");
		} catch (error) {
			if (error.response.status == 404) setEmailNotFound(true);
			else if (error.response.status == 401) {
				setWrongPassword(true);
				setEmailNotFound(false);
			} else {
				alert(
					"Serverlarımız bir sorun ile karşılaştı. Yaşanan aksaklık için üzgünüz."
				);
			}
		} finally {
			setPendingRequest(false);
		}
	}

	if (redirectToHome) {
		return <Navigate to={"/"} />;
	}

	return (
		<>
			{forgotPassword && (
				<div
					onClick={() => setForgotPassword(false)}
					className="fixed top-0 left-0 w-screen h-screen z-10 bg-black/50"
				>
					<div className="w-full h-screen flex justify-center items-center">
						<div
							onClick={(ev) => ev.stopPropagation()}
							className="w-full mr-4 ml-4 sm:max-w-xl h-96  bg-white rounded-xl z-20"
						>
							<div className="flex justify-between p-8 items-center">
								<h1 className="font-semibold text-xl">Şifremi Unuttum</h1>
								<svg
									className="cursor-pointer"
									onClick={() => setForgotPassword(false)}
									xmlns="http://www.w3.org/2000/svg"
									width="50"
									height="50"
									fill="currentColor"
									viewBox="0 0 16 16"
								>
									<path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
								</svg>
							</div>
							<h1 className="pr-8 pl-8">
								Yeni şifrenizi yenileme linkini gönderebileceğimiz kayıtlı mail
								adresinizi yazınız.
							</h1>
							<div className=" w-full flex justify-center">
								<form className="flex flex-col text-xl mt-10 w-full mr-10 ml-10 md:max-w-xl">
									<input
										className="border-b-2 placeholder-black focus:outline-none pb-4"
										type="email"
										placeholder="E-posta Adresi"
										value={forgotPasswordEmail}
										onChange={(ev) => setForgotPasswordEmail(ev.target.value)}
									/>
									<button className="primary mt-10 ">Gönder</button>
								</form>
							</div>
						</div>
					</div>
				</div>
			)}
			{pendingRequest && (
				<div className="fixed top-0 left-0 min-h-screen min-w-full cursor-wait"></div>
			)}
			<div className={pendingRequest ? "pointer-events-none" : undefined}>
				<div className="flex justify-center font-normal text-4xl text-gray-400 mt-10">
					<Link to={"/login"}>
						<h1 className=" pr-5 pt-2 pb-2 text-black">Giriş Yap</h1>
					</Link>
				</div>
				<div className=" w-full flex justify-center">
					<form
						onSubmit={(ev) => {
							handleLoginRequest(ev);
						}}
						className="flex flex-col text-xl mt-10 w-full mr-10 ml-10 md:max-w-xl"
					>
						<input
							className={
								"border-b-2 border-gray-500 placeholder-black focus:outline-none pb-4" +
								(emailNotFound ? " border-red-500 " : "")
							}
							type="email"
							placeholder="E-posta Adresi"
							value={email}
							onChange={(ev) => {
								setEmail(ev.target.value);
								setEmailNotFound(false);
							}}
						/>
						{emailNotFound && (
							<h1 className="text-red-500">Eşleşen bir hesap bulunamadı.</h1>
						)}
						<div
							className={
								"flex justify-between border-b-2 border-gray-500  pb-4 mt-10" +
								(wrongPassword ? " border-red-500 " : "")
							}
						>
							<input
								className="placeholder-black focus:outline-none w-full"
								type={togglePasswordVisibility ? "text" : "password"}
								placeholder="Şifre"
								value={password}
								onChange={(ev) => {
									setPassword(ev.target.value);
									setWrongPassword(false);
								}}
							/>
							<div
								className="cursor-pointer"
								onClick={() =>
									setTogglePasswordVisibility(!togglePasswordVisibility)
								}
							>
								{!togglePasswordVisibility ? (
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="26"
										height="26"
										fill="currentColor"
										viewBox="0 0 16 16"
									>
										<path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z" />
										<path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0" />
									</svg>
								) : (
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="26"
										height="26"
										fill="currentColor"
										viewBox="0 0 16 16"
									>
										<path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7 7 0 0 0-2.79.588l.77.771A6 6 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755q-.247.248-.517.486z" />
										<path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829" />
										<path d="M3.35 5.47q-.27.24-.518.487A13 13 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7 7 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12z" />
									</svg>
								)}
							</div>
						</div>
						{wrongPassword && (
							<h1 className="text-red-500">Şifrenizi kontrol ediniz.</h1>
						)}
						<div className="flex justify-end mt-4">
							<h1
								onClick={() => setForgotPassword(true)}
								className="font-light text-base cursor-pointer "
							>
								Şifremi Unuttum
							</h1>
						</div>

						<button
							className={
								"cursor-pointer rounded-full p-6 mt-10 text-base text-white " +
								(pendingRequest ? "bg-gray-500" : "bg-black")
							}
						>
							Giriş Yap
						</button>
					</form>
				</div>
			</div>
		</>
	);
}
