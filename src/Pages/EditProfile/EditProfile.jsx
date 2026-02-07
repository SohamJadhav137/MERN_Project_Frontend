import React, { useEffect, useState } from 'react'
import countries from '../../Data/Countries';

import './EditProfile.scss';
import languages from '../../Data/Languages';
import { getCurrentUser } from '../../utils/getCurrentUser';
import { useNavigate } from 'react-router-dom';
import { Brush, ChevronDown, Languages, MapPin } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Swal from 'sweetalert2';
import API_BASE_URL from '../../utils/api';

export default function EditProfile() {

    const [country, setCountry] = useState(null);
    const [formData, setFormData] = useState({
        country: '',
        languages: [],
        skills: []
    })

    const [chipInput, setChipInput] = useState('');
    const [errorIndicator, setErrorIndicator] = useState(null);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const changeCountry = (c) => {
        setFormData({ ...formData, country: c });
        setCountry(c);
    };

    const addChip = (e) => {
        if (e.key === 'Enter' || e.key === 'Tab') {
            e.preventDefault();

            const newChip = chipInput.trim().toUpperCase();

            if (newChip && !formData.skills.includes(newChip)) {
                setFormData({ ...formData, skills: [...formData.skills, newChip] });
                setChipInput('');
            }
        }
    };

    const deleteChip = (chipToDelete) => {
        setFormData({ ...formData, skills: formData.skills.filter(c => c !== chipToDelete) });
    };

    const addLang = (l) => {

        const newChip = l.trim().toUpperCase();

        if (newChip && !formData.languages.includes(newChip)) {
            setFormData({ ...formData, languages: [...formData.languages, newChip] });
            setChipInput('');
        }
    };

    const deleteLang = (langToDelete) => {
        setFormData({ ...formData, languages: formData.languages.filter(l => l !== langToDelete) });
    };

    const user = getCurrentUser();
    const userId = user.id;
    const token = localStorage.getItem("token");

    // Fetching user details
    useEffect(() => {
        const fetchUserDetails = async () => {

            try {
                const res = await fetch(`${API_BASE_URL}/api/user/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })

                if (res.ok) {
                    const data = await res.json();
                    const user = data.user || {};
                    setFormData({
                        country: user.country,
                        languages: user.languages,
                        skills: user.skills
                    });
                    setCountry(user.country);
                }
                else {
                    console.error("Failed to fetch user details:", res.status);
                }
            } catch (error) {
                console.error("Some error occured:", error);
            }
        }

        fetchUserDetails();
    }, [userId]);

    const formSubmitHandler = async (e) => {
        e.preventDefault();

        if (!formData.country) {
            setError("Please select your country!");
            return;
        }

        if (formData.languages.length === 0) {
            setError("Please select atleast one language!");
            return;
        }

        if (user.role === 'seller' && formData.skills.length === 0) {
            setError("Please enter atleast one skill!");
            return;
        }

        setError('');
        try {
            const res = await fetch(`${API_BASE_URL}/api/user/${userId}/edit-profile`, {
                method: 'PATCH',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const responseData = await res.json().catch(e => {
                console.error("Failed to parse JSON response:", e);
                return { message: "Some error occured while parsing JSON response!" }
            });

            if (res.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Profile updated',
                    text: 'Your profile changes have been saved successfully.',
                    confirmButtonText: 'Okay',
                    confirmButtonColor: '#018790',
                    customClass: {
                        popup: 'swal-custom-popup',
                        title: 'swal-custom-title'
                    }
                });
                navigate('/my-profile');
                console.log("Updated profile:\n", responseData);
            }
            else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to update your profile!',
                    confirmButtonText: 'Okay',
                    confirmButtonColor: '#018790',
                    customClass: {
                        popup: 'swal-custom-popup',
                        title: 'swal-custom-title'
                    }
                });
            }
        } catch (error) {
            console.error("Some error occured:", error);
        }
    }

    const redirectToProfile = () => {
        navigate('/my-profile');
    }

    const onChangeHandler = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className='edit-profile-container'>
            <div className="edit-profile">
                <div className="edit-profile-title">
                    Edit Profile
                </div>
                <form className="signup" onSubmit={formSubmitHandler}>
                    <div className="step-container animate-right">

                        <button onClick={redirectToProfile} type='button' className='prev-step-btn'>
                            <FontAwesomeIcon icon="fa-solid fa-arrow-left" /> Back to profile
                        </button>

                        <div className="error-slot">
                            {error && <span className='error-text'>{error}</span>}
                        </div>

                        <label htmlFor="edit-country" className='label-item'>Country</label>
                        <div className="input-wrapper">
                            <MapPin className='input-icon' size={18} />
                            <select name="country" id="edit-country" value={country || ''} onChange={onChangeHandler}>
                                <option value="" disabled>Select country</option>
                                {
                                    countries.map(c => (
                                        <option value={c} key={c}>{c}</option>
                                    ))
                                }
                            </select>
                            <ChevronDown className='eye-icon' size={18} />
                        </div>

                        <label htmlFor="edit-language" className='label-item'>Spoken Language(s)</label>
                        <div className="input-wrapper">
                            <Languages className='input-icon' size={18} />
                            <select name="language" id="edit-language" defaultValue='' onChange={(e) => { addLang(e.target.value); e.target.value = ''; }}>
                                <option value="" disabled>Select language</option>
                                {
                                    languages.map((l, i) => (
                                        <option key={l} value={l}>{l}</option>
                                    ))
                                }
                            </select>
                            <ChevronDown className='eye-icon' size={18} />
                        </div>
                        <div className="chips-container">
                            {
                                formData.languages.map((l, i) => (
                                    <div className="chip" key={i} onClick={() => deleteLang(l)}>{l} &times;</div>
                                ))
                            }
                        </div>

                        {
                            user.role === 'seller' &&
                            <>
                                <label htmlFor="edit-skill" className='label-item'>Skill(s)</label>
                                <div className="input-wrapper">
                                    <Brush className='input-icon' size={18} />
                                    <input type="text" onChange={(e) => setChipInput(e.target.value)} onKeyDown={addChip} value={chipInput} placeholder='Type a skill and press enter' />
                                </div>
                                <div className="chips-container">
                                    {
                                        formData.skills.map((s, i) => (
                                            <div className="chip" key={i} onClick={() => deleteChip(s)}>{s} &times;</div>
                                        ))
                                    }
                                </div>
                            </>
                        }

                        <button type="submit" className='auth-button' onClick={formSubmitHandler}>
                            Save changes
                        </button>
                    </div>
                </form>
                {/* <div className="edit-profile-contents">
                    {
                        errorIndicator &&
                        <div className="error-div">
                            {errorIndicator}
                        </div>
                    } */}
                {/* <table>
                        <tbody> */}
                {/* ///////////////////////////// COUNTRY //////////////////////////////// */}
                {/* <tr>
                                <td>
                                    <label htmlFor="edit-country" className='label-item'>Country</label>
                                </td>
                                <td>
                                    <select name="country" id="edit-country" defaultValue='' onChange={(e) => changeCountry(e.target.value)} >
                                        <option value="" disabled>Select a country</option>
                                        {
                                            countries.map(c => (
                                                <option key={c} value={c} >{c}</option>
                                            ))
                                        }
                                    </select>
                                    <div className="chip shift-right">
                                        {country}
                                    </div>
                                </td>
                            </tr> */}
                {/* ///////////////////////////// LANGUAGES //////////////////////////////// */}
                {/* <tr>
                                <td>
                                    <label htmlFor="edit-language" className='label-item'>Languages</label>
                                </td>
                                <td>
                                    <div className="lang-chips-container">
                                        {
                                            formData.languages.map((l, i) => (
                                                <div className="chip" key={i} onClick={() => deleteLang(l)}>{l} &times;</div>
                                            ))
                                        }
                                    </div>
                                    <select name="language" id="edit-language" defaultValue='' onChange={(e) => { addLang(e.target.value); e.target.value = ''; }}>
                                        <option value="" disabled>Select a language</option>
                                        {
                                            languages.map((l, i) => (
                                                <option key={l} value={l}>{l}</option>
                                            ))
                                        }
                                    </select>
                                </td>
                            </tr> */}
                {/* ///////////////////////////// SKILLS //////////////////////////////// */}
                {/* <tr>
                                <td>
                                    <label htmlFor="edit-skill" className='label-item'>Skills</label>
                                </td>
                                <td>
                                    <div className="skill-container">
                                        {
                                            formData.skills.map((s, i) => (
                                                <div className="chip" key={i} onClick={() => deleteChip(s)}>{s} &times;</div>
                                            ))
                                        }
                                    </div>
                                    <input type="text" onChange={(e) => setChipInput(e.target.value)} onKeyDown={addChip} value={chipInput} placeholder='Type a skill and press enter' />
                                </td>
                            </tr>
                            <tr>
                                <td colSpan={2}>
                                    <div className="profile-action-buttons">
                                        <button className='profile-save-btn' onClick={formSubmitHandler}>Save</button>
                                        <button className='profile-cancel-btn' onClick={redirectToProfile}>Cancel</button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table> */}
                {/* </div> */}
            </div>
        </div>
    )
}
