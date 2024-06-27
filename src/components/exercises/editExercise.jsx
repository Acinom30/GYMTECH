import React from 'react';
import { useParams } from 'react-router-dom';
import ExerciseForm from './exerciseForm';

const EditExercise = () => {
    const { id } = useParams();
    return <ExerciseForm formType="edit" exerciseId={id} />;
};

export default EditExercise;
