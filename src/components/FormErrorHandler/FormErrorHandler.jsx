import React from "react";

const FormErrorHandler = ({ errors, message }) => {
  return (
    <div
      className={`${
        errors ? "flex" : "hidden"
      } text-red-500 font-[Inter-Regular] text-sm`}
    >
      <p>{message}</p>
    </div>
  );
};

export default FormErrorHandler;
