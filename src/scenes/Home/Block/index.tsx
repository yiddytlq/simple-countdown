import NumberDisplay from '../NumberDisplay';

interface BlockProps {
  value: string;
  title: string;
}

function Block({ value, title }: BlockProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-md bg-[#d3d3d3]/35 px-6 py-4 shadow-[0_5px_33px_-13px_rgba(0,0,0,0.5)] sm:px-10 sm:py-8">
      <div
        aria-hidden="true"
        className="flex items-center justify-center text-6xl sm:text-7xl lg:text-8xl"
      >
        {value.split('').map((v, k) => (
          <NumberDisplay value={+v} key={k} />
        ))}
      </div>
      <div className="mt-2 text-xl text-white sm:text-2xl lg:text-3xl">{title}</div>
    </div>
  );
}

export default Block;
