import React from 'react';

const Dialog = ({ data, onClose }) => {
  return (
    <>
      {data === 'success' && (
        <div>
          <div className="text-center">
            <i className="fa-regular fa-circle-check text-success"></i>
          </div>
          <h1 className="text-center text-success">SUCCESS</h1>

          <div>
            <h3>Hey! We got your details, We'll get back to you immediately</h3>
          </div>
          <div className="text-center">
            <button
              type="button"
              onClick={onClose}
              style={{ padding: '5px 20px', margin: '10px' }}
              className="btn theme-btn-1 btn-effect-1 text-uppercase"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {data === 'error' && (
        <div>
          <div className="text-center">
            <i className="fa-regular fa-circle-xmark text-danger"></i>
          </div>
          <h1 className="text-center text-danger">ERROR</h1>

          <div>
            <h3>Something went wrong</h3>
          </div>
          <div className="text-center">
            <button
              type="button"
              onClick={onClose}
              style={{ padding: '5px 20px', margin: '10px' }}
              className="btn theme-btn-1 btn-effect-1 text-uppercase"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Dialog;
