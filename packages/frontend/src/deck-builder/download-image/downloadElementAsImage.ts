import html2canvas from 'html2canvas';

export const downloadElementAsImage = async (element: HTMLElement, name: string) => {
  const canvas = await html2canvas(element, {
    useCORS: true,
  });
  const img = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = img;
  link.download = name + '.png';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
