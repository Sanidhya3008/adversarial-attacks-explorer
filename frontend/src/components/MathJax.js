import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

const MathComponent = ({ tex, inline = false }) => {
  try {
    return inline ? (
      <InlineMath math={tex} />
    ) : (
      <BlockMath math={tex} />
    );
  } catch (error) {
    console.error("Error rendering LaTeX:", error, tex);
    return <div className="math-error">Error rendering equation: {tex}</div>;
  }
};

export default MathComponent;