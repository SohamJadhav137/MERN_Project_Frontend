import React, { useState } from 'react'

import './CreateGig.scss';
export default function CreateGig() {

    const [formData, setFormData] = useState({
        title: '',
        desc: '',
        category: '',
        tags: [],
        imageURLs: [],
        videoURL: null,
        docURLs: [],
        price: '',
        deliveryDays: '',
        revisions: ''
    });

    const [tagInput, setTagInput] = useState('');

    const keyDownHandlers = (e) => {
        if(e.key === "Enter" || e.key === "Tab"){
            e.preventDefault();

            const newTag = tagInput.trim().toLowerCase();

            if(newTag && !formData.tags.includes(newTag)){
                setFormData({...formData, tags: [...formData.tags, newTag]});
                setTagInput('');
            }
        }
    };

    const deleteTagHandler = (tagToDelete) => {
        setFormData({ ...formData, tags: formData.tags.filter(tag => tag !== tagToDelete)});
    };

    const changeHandler = (e) => {
        const { name, value } = e.target;
        setFormData({...formData, [name]: value});
    };

    const fileUploadHandler = (e) => {
        const { id, files } = e.target;
        
        if(id === 'gig-images'){
            setFormData({...formData, imageURLs: Array.from(files)});
        }
        else if(id === 'gig-video'){
            setFormData({...formData, videoURL: files[0]});
        }
        else if(id === 'gig-docs'){
            setFormData({...formData, docURLs: Array.from(files)});
        }
    };

    const validateForm = () => {
        const { title, category, desc, imageURLs, price, deliveryDays, revisions} = formData
        let errors = [];

        if(!title.trim()) errors.push("Title field is empty!");
        if(!category || category === '') errors.push("Category is required!")
        if(!desc.trim()) errors.push("Description is empty!");
        if(imageURLs.length === 0) errors.push("Atleast one image is required!");
        if(!price || isNaN(price) || price < 0) errors.push("Enter valid price!");
        if(!deliveryDays || isNaN(deliveryDays) || deliveryDays < 0) errors.push("Enter valid number for days!");
        if(!revisions || isNaN(revisions) || revisions < 0) errors.push("Enter valid number for revisions!");

        if(errors.length > 0)
            return false;

        return true;
    }

    const formSubmitHandler = () => {
        e.preventDefault();
        if(!validateForm) return;

        console.log("Validated form:", formData);
    }
    return (
        <div className='create-gig-container'>
            <form className="create-gig" onSubmit={formSubmitHandler}>
                <div className='main-heading'>Create your gig</div>
                <div className="phase-item">
                    <span className='sub-heading'>Step-1: Gig Overview</span>
                    <table>
                        <tbody>
                            <tr>
                                <td>
                                    <label htmlFor="gig-title" className='label-item'>Title</label>
                                </td>
                                <td>
                                    <input type="text" id="gig-title" name='title' onChange={changeHandler} value={formData.title}/>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <label htmlFor="gig-category" className='label-item'>Category</label>
                                </td>
                                <td>
                                    <select id="gig-category" name='category' onChange={changeHandler} value={formData.category}>
                                        <option value="" disabled>Select a category</option>
                                        <option value="software-development">Software development</option>
                                        <option value="video-editing">Video Editing</option>
                                        <option value="digital-marketing">Digital Marketing</option>
                                        <option value="graphic-desgining">Graphic Designing</option>
                                        <option value="music-and-audio">Music & Audio</option>
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <label htmlFor="gig-desc" className='label-item'>Description</label>
                                </td>
                                <td>
                                    <textarea name="desc" id="gig-desc" className='desc' onChange={changeHandler} value={formData.desc} placeholder='Upto 1,200 characters'></textarea>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <label htmlFor="gig-tags" className='label-item'>Tags</label>
                                </td>
                                <td>
                                    <div className="gig-tags">
                                        { formData.tags.map((tag, index) => (
                                            <div key={index} className='tag-pill' onClick={() => deleteTagHandler(tag)}>
                                                {tag} &times;
                                            </div>
                                        )) }
                                    </div>
                                    <input type="text" id="gig-tags" className='label-title' onChange={(e) => setTagInput(e.target.value)} value={tagInput} onKeyDown={keyDownHandlers} placeholder='Type a tag and hit enter'/>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="phase-item">
                    <span className='sub-heading'>Step-2: Gig Visuals</span>
                    <table>
                        <tbody>
                            <tr>
                                <td>
                                    <label htmlFor="gig-images" className='label-item'>Images</label>
                                </td>
                                <td>
                                    <input type="file" id='gig-images' onChange={fileUploadHandler} multiple accept='image/'/>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <label htmlFor="gig-video" className='label-item'>Video</label>
                                </td>
                                <td>
                                    <input type="file" id='gig-video' onChange={fileUploadHandler} accept='video/'/>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <label htmlFor="gig-docs" className='label-item'>Documents</label>
                                </td>
                                <td>
                                    <input type="file" id="gig-docs" multiple onChange={fileUploadHandler} accept='.pdf,.doc,.docx'/>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="phase-item">
                    <span className='sub-heading'>Step-3: Pricing</span>
                    <table>
                        <tbody>
                            <tr>
                                <td>
                                    <label htmlFor="gig-price" className='label-item'>Price</label>
                                </td>
                                <td>
                                    <input name='price' type="text" id="gig-price" onChange={changeHandler} value={formData.price} placeholder='Price will be set in Rupees(₹)' />
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <label htmlFor="gig-delivery-days" className='label-item'>Delivery in</label>
                                </td>
                                <td>
                                    <input name='deliveryDays' type="text" id="gig-delivery-days" onChange={changeHandler} value={formData.deliveryDays} />
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <label htmlFor="gig-revisions" className='label-item'>Revisions</label>
                                </td>
                                <td>
                                    <input name='revisions' type="text" id="gig-revisions" onChange={changeHandler} value={formData.revisions} />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="phase-item">
                    <span className='sub-heading'>Step-4: Publish</span>
                    <table>
                        <tbody>
                            <tr>
                                <td>
                                    <button type='submit'>Publish</button>
                                </td>
                                <td>
                                    <span>Want to review your gig ? Go to top</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </form>
        </div>
    )
}
