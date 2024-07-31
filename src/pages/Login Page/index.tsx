import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import Cookies from 'js-cookie'
import './index.css'
import useAuthorizeUser from './authorizeUser'

const Login: React.FC = () => {
	const { isAuthenticated, user, loginWithRedirect } = useAuth0()
	const navigate = useNavigate()
	const authorizeUser = useAuthorizeUser()

	useEffect(() => {
		if (authorizeUser === null) return
		if (authorizeUser) {
			navigate('/home')
		} else {
			loginWithRedirect()
		}
	}, [authorizeUser])

	return <></>
}

export default Login
