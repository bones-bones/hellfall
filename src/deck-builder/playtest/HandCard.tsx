type Props = { image: string; onClick: any };
export const HandCard = ({ image, onClick }: Props) => {
  return <img height="300px" src={image} key={image} onClick={onClick} />;
};
