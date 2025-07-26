export function createPortal(node: HTMLElement, targetSelector: string = '#toast-portal') {
	let target = document.querySelector(targetSelector) as HTMLElement | null;
	if (!target) {
		// Si no existe, creamos un contenedor en el body
		target = document.createElement('div') as HTMLElement;
		target.id = targetSelector.replace('#', '');
		// Asignamos un z-index alto al contenedor
		target.style.zIndex = '1100';
		document.body.appendChild(target);
	}
	target.appendChild(node);

	return {
		destroy() {
			if (node.parentNode) {
				node.parentNode.removeChild(node);
			}
		}
	};
}
