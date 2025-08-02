import { createReactBlockSpec } from "@blocknote/react";
import { defaultProps } from "@blocknote/core";
import ModelViewer from "./ModelViewer";
import { HiDownload } from "react-icons/hi";

function handleDownload(fileUrl) {
	const link = document.createElement("a");
	link.href = fileUrl;
	link.download = "3d Model";
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}

export const ThreeDObjectBlock = createReactBlockSpec(
	{
		type: "threeDObject",
		propSchema: {
			url: { default: "" },
			instanceId: { default: () => crypto.randomUUID() }, // ✅ unique per block
		},
		content: "none",
	},
	{
		render: (props) => {
			const { url, instanceId } = props.block.props;

			return (
				<div
					className="border relative border-gray-300 w-full h-80 rounded p-2 bg-gray-100"
					contentEditable={false}
					key={instanceId} // ✅ unique DOM mount per block instance
				>
					{url ? (
						<ModelViewer key={instanceId} url={url} />
					) : (
						<div className=" text-gray-500">No 3D model uploaded yet</div>
					)}

					<HiDownload
						onClick={() => handleDownload(url)}
						title="Modeli indir"
						className="m-2 absolute cursor-pointer  bottom-2 left-2"
					/>
				</div>
			);
		},
	}
);
