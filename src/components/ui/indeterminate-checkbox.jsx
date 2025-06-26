import React, { useEffect, useRef } from 'react';

const IndeterminateCheckbox = React.forwardRef(
  ({ indeterminate, ...rest }, ref) => {
    const defaultRef = useRef();
    const resolvedRef = ref || defaultRef;

    useEffect(() => {
      if (resolvedRef.current) {
        resolvedRef.current.indeterminate = indeterminate;
      }
    }, [resolvedRef, indeterminate]);

    return (
      <input
        type="checkbox"
        ref={resolvedRef}
        {...rest}
        className="cursor-pointer"
      />
    );
  }
);

IndeterminateCheckbox.displayName = 'IndeterminateCheckbox';

export { IndeterminateCheckbox }; 