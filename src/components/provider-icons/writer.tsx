import type { SVGProps } from 'react';

export const Writer = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      fill="none"
      height="83"
      viewBox="0 0 82 83"
      width="82"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>Writer</title>
      <circle cx="41" cy="41.7297" r="41" />
      <path
        clipRule="evenodd"
        d="M57.8953 50.445L63.3736 27.8425H59.9879H55.755H52.417L57.8953 50.445Z"
        fill="white"
        fillRule="evenodd"
      />
      <path
        clipRule="evenodd"
        d="M38.9843 27.8425H35.5986L43.2172 59.2755H46.6029H50.8358H54.2215L46.6029 27.8425H43.2172H38.9843Z"
        fill="white"
        fillRule="evenodd"
      />
      <path
        clipRule="evenodd"
        d="M29.7845 27.8428H22.1659L22.1661 27.8434H18.7803L26.3989 59.2763H34.0175L34.0173 59.2757H37.4031L29.7845 27.8428Z"
        fill="white"
        fillRule="evenodd"
      />
    </svg>
  );
};
