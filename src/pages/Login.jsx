import React, { useEffect, useState } from 'react';
import LoginForm from '../components/LoginForm';
import { useNavigate } from 'react-router-dom';
import { verifyToken } from '../utils/tokenUtils';

function Login() {
    const navigate = useNavigate();
    const [formVisible, SetFormVisible] = useState(false);

    useEffect(() => {
        const checkToken = async () => {
            const redirectPath = await verifyToken();

            if (redirectPath) {
                SetFormVisible(true);
                navigate(redirectPath);
            } else {
                navigate('/dashboard');
            }
        };

        checkToken();
    }, [navigate]);

    return (
        formVisible && <LoginForm />
    );
}

export default Login;