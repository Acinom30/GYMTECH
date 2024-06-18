import React from 'react';
import { useLocation } from 'react-router-dom';
import UserForm from './userForm';

const UpdateUser = () => {
    const location = useLocation();
    const { user } = location.state || {};
    console.log(user)
    return (
        <UserForm initialData={user} isUpdate={true} />
    );
};

export default UpdateUser;