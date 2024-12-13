// src/components/common/CoordinateInputForm.tsx
import React, { useState } from 'react';
import Input from './Input';

interface CoordinateInputFormProps {
  onSubmit: (coordinates: { x: string; y: string; z: string }) => void;
}

const CoordinateInputForm: React.FC<CoordinateInputFormProps> = ({ onSubmit }) => {
  const [coordinates, setCoordinates] = useState({
    x: '',
    y: '',
    z: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCoordinates(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    onSubmit(coordinates);
  };

  return (
    <div className="flex flex-col gap-5 pt-2">
      <div className="flex gap-3">
        <Input
          name="x"
          placeholder="X 좌표"
          value={coordinates.x}
          onChange={handleChange}
          type="number"
        />
        <Input
          name="y"
          placeholder="Y 좌표"
          value={coordinates.y}
          onChange={handleChange}
          type="number"
        />
        <Input
          name="z"
          placeholder="Z 좌표"
          value={coordinates.z}
          onChange={handleChange}
          type="number"
        />
      </div>
      <button 
        onClick={handleSubmit}
        className="self-end px-5 py-2 bg-blue-500 text-white rounded-md font-medium hover:bg-blue-600 transition-colors"
      >
        확인
      </button>
    </div>
  );
};

export default CoordinateInputForm;