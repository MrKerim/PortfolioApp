export default function IndexPageLoading() {
	return (
		<>
			<div className="w-full flex justify-center">
				<div className=" h-full max-w-4xl mt-12 w-full sm:flex justify-around">
					<div className="w-full max-h-44 sm:w-1/2 flex justify-center  rounded-2xl  py-6 ">
						<div className="w-sm">
							<div>
								<div className="flex w-full">
									<div className="bg-gray-300 rounded-full h-8 w-full animate-pulse"></div>
								</div>
								<div className="flex w-full gap-2 mt-4">
									<div className="bg-gray-300 rounded-full h-8 w-1/4 animate-pulse"></div>
									<div className="bg-gray-300 rounded-full h-8 w-full animate-pulse"></div>
								</div>
								<div className="flex w-full gap-2 mt-4">
									<div className="bg-gray-300 rounded-full h-8 w-1/4 animate-pulse"></div>
									<div className="bg-gray-300 rounded-full h-8 w-1/3 animate-pulse"></div>
								</div>
								<div className="flex w-full gap-2 mt-4">
									<div className="bg-gray-400 rounded-full h-8 w-1/2 animate-pulse"></div>
								</div>
								<div className="flex w-full mt-4 gap-2">
									<div className="bg-gray-300 rounded-full h-8 w-1/3 animate-pulse"></div>
								</div>
							</div>
						</div>
					</div>

					<div className=" rounded-2xl p-2 mt-28 sm:mt-0 w-full flex justify-center sm:w-1/3">
						<div className="w-4/5 sm:w-full">
							<div className="w-80 h-80 relative overflow-hidden">
								<div className="w-full h-full bg-gray-200 animate-pulse rounded-2xl"></div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
