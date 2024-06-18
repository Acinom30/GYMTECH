import React from 'react';
import { useParams } from 'react-router-dom';
import CategoryForm from './categoryForm';

const EditCategory = () => {
    const { id } = useParams();
    return <CategoryForm formType="edit" categoryId={id} />;
};

export default EditCategory;
