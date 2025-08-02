import React, { useState, useEffect } from "react";

export default function ProjectsPageImage({ lowResSrc, highResSrc, alt }) {
	const [src, setSrc] = useState(lowResSrc);

	useEffect(() => {
		const img = new Image();
		img.src = highResSrc;
		img.onload = () => {
			setSrc(highResSrc);
		};
	}, [highResSrc]);

	return (
		<img
			className="rounded-2xl shadow-2xl opacity-75 hover:opacity-100 duration-200 ease-in"
			src={src}
			alt={alt}
			style={{
				height: 250,
				width: "auto",
				objectFit: "cover",
			}}
		/>
	);
}
