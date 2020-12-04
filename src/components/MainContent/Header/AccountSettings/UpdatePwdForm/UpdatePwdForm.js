import React, { useState } from "react";
import DOMPurify from 'dompurify';
import styles from '../AccountSettings.module.scss';
import axios from '../../../../../axios';
import * as passwordHash from 'password-hash'; //import npm pass https://www.npmjs.com/package/password-hash
import { motion } from "framer-motion";

const UpdatePwdForm = props => {
	let [oldPassword, setOldPassword] = useState('');
	let [newPassword, setNewPassword] = useState('');
	let [confirmNewPassword, setConfirmNewPassword] = useState('');
	let [pwdError, setPwdError] = useState('');

	//adds new password to database for authenticated user
	const updatePwd = async () => {
		let newHashedPassword = passwordHash.generate(newPassword);
		//Cant not set pwd field to string because axios requires to pass object. So we have to pass the entire user object with the updated pwd.
		let oldUser = await axios.get('users/u' + props.authUID + '.json')
		.catch(err => console.log(err));
		let updatedUser = {...oldUser.data};
		updatedUser.password = newHashedPassword;
		axios.put('users/u' + props.authUID + '.json', updatedUser)
		.then(res => {
			if(res) {
				console.log('changed password!!!');
				props.setShowSettings(false);
			}
		})
		.catch(err => setPwdError(`${pwdError} Failed to update Password: ${err}`));	
	}

	//makes sure new password and confirmed pwd fields are the same
	const confirmPwd = () => {
		if(newPassword === confirmNewPassword) {
			return true;
		} else {
			setPwdError(`${pwdError} Passwords do not match.`);
			return false;
		}
	}

	//calls checkPwd if correct then updates db to new pwd for auth user
	const handlePwdSubmit = async e => {
		e.preventDefault();
		setPwdError('');
		let passwordCorrect;
		oldPassword = await DOMPurify.sanitize(oldPassword);
		oldPassword = await oldPassword.replace(/[^\w]/g,'');
		if(oldPassword.length > 5 && newPassword.length > 5) {	
			passwordCorrect = await props.checkPwd(oldPassword);
			if(passwordCorrect && passwordCorrect !== 300) {
				if(confirmPwd()) {
					updatePwd();
				}
			} else {
				setPwdError(`${pwdError} Incorrect current password.`);
			}
		} else {
			setPwdError(`${pwdError} Password must be at least five characters long.`);
		}
	}

	return(
		<motion.div initial="hidden" animate="visible" variants={{
			hidden: {
				opacity: 0
			},
			visible: {
				opacity: 1,
				scale: 1
			}
		}}>
			<form onSubmit={ handlePwdSubmit } className={ styles.form }>
				<legend>Update Your Password</legend>
				<span>{pwdError}</span>
				<label htmlFor="oldPassword">Current Password</label>
				<input 
					className={ styles.input }
					type="password" 
					id="oldPassword" 
					name="oldPassword" 
					placeholder="Enter your current password"
					aria-label="Enter your current password"
					onChange={ e => setOldPassword(e.target.value) }
				/>
				<label htmlFor="newPassword">New Password</label>
				<input
					className={ styles.input } 
					type="password" 
					id="newPassword" 
					name="newPassword" 
					placeholder="Enter your new password"
					aria-label="Enter your new password"
					onChange={ e => setNewPassword(e.target.value) }
				/>
				<label htmlFor="confirmNewPassword">Confirm New Password</label>
				<input
					className={ styles.input } 
					type="password" 
					id="confirmNewPassword" 
					name="confirmNewPassword" 
					placeholder="Please confirm your new password"
					aria-label="Please confirm your new password"
					onChange={ e => setConfirmNewPassword(e.target.value) }
				/>
				<span role="alert" aria-label="Errors for entered data in the password form will display here">{pwdError}</span>
				<button aria-label="Click to proceed updating your password" className={ styles.submit }>Submit</button>
			</form>
		</motion.div>
	);
}

export default UpdatePwdForm;