export default function ProjectEditorLoading() {
	return (
		<>
			<div className="shadow-xl absolute top-0 left-0 w-full h-80 bg-gray-300 animate-pulse"></div>

			<div className="mt-64 w-full flex justify-center">
				<div className="mx-8 w-full md:w-3xl lg:w-5xl">
					<div>
						<div className="flex w-full gap-2 ">
							<div className="bg-gray-400 rounded-full h-10 w-1/4 animate-pulse"></div>
						</div>

						<div className="flex w-full mt-12">
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
		</>
	);
}
