import React from "react";

export default function ConfirmationDialog({
	open,
	setOpen,
	onAccept,
	onCancel,
	title = "Confirm",
	description = "Are you sure?",
}) {
	if (!open) return null;

	const handleAccept = () => {
		onAccept();
		setOpen(false);
	};

	const handleCancel = () => {
		onCancel();
		setOpen(false);
	};

	return (
		<div className="fixed inset-0 bg-[#00000080] flex justify-center items-center z-50">
			<div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
				<h2 className="text-xl font-semibold mb-4">{title}</h2>
				<p className="mb-6 text-sm text-gray-500">{description}</p>
				<div className="flex justify-end space-x-4">
					<button
						onClick={handleCancel}
						className="duration-200 ease-in font-light cursor-pointer px-6 py-1 rounded border border-gray-300 bg-white shadow hover:bg-gray-100"
					>
						İptal
					</button>
					<button
						onClick={handleAccept}
						className="duration-200 ease-in  font-light cursor-pointer px-6 py-1 rounded bg-black text-white hover:bg-gray-800"
					>
						Evet
					</button>
				</div>
			</div>
		</div>
	);
}
