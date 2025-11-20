import React, { useContext, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import socket from '../../socket';

import './Order.scss';

const formatBytesToSize = (bytes) => {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return '';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    if (i == 0) return bytes + ' ' + sizes[i];
    return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
};

export default function Order() {

    const { user } = useContext(AuthContext);

    const { id } = useParams();
    const [order, setOrder] = useState(null);
    let gigId = order?.gigId,
        sellerId = order?.sellerId,
        buyerId = order?.buyerId;

    const [gigTitle, setGigTitle] = useState(null);
    const [coverImage, setCoverImage] = useState(null);
    const [username, setUsername] = useState(null);
    const [userId, setUserId] = useState(null);

    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const options = {
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: "UTC"
    };
    const finalCreatedDate = order ? new Date(order.createdAt).toLocaleDateString('en-us', options) : '';
    const finalUpdatedDate = order ? new Date(order.updatedAt).toLocaleDateString('en-us', options) : '';


    // set userId based on role
    useEffect(() => {
        if (!order) return;

        if (user.role === 'seller') {
            setUserId(buyerId);
        }
        else {
            setUserId(sellerId);
        }
    }, [order, user.role]);

    // Fetch single order
    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/orders/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })

                if (response.ok) {
                    const data = await response.json();
                    setOrder(data);
                }
                else {
                    console.error("Failed to fetch single order details:\n", response.status);
                }
            } catch (error) {
                console.error("Some error occured while fetching order details:\n", error);
            }
        }

        fetchOrderDetails();
    }, [id]);

    // Buyer joining room to receive order in real time 
    console.log("Buyer ID:", buyerId);
    useEffect(() => {
        if (socket.connected && buyerId) {
            socket.emit('joinRoom', buyerId);
            console.log('Buyer joined the room');
        }
    }, [buyerId]);

    // Update order details at buyer side once the order is delivered by seller
    useEffect(() => {
        socket.on("orderDelivered", (payload) => {
            console.log("Order payload:", payload.updatedOrder);
            if (payload.updatedOrder._id === id) {
                setOrder(payload.updatedOrder);
            }
        })

        return () => {
            socket.off("orderDelivered");
        }
    }, [id, setOrder]);

    // Fetch gig details
    useEffect(() => {
        const fetchGigTitle = async () => {
            if (!gigId) return;

            try {
                const response = await fetch(`http://localhost:5000/api/gigs/${gigId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    // console.log(data);
                    setGigTitle(data.gig.title);
                    setCoverImage(data.gig.coverImageURL)
                }
                else {
                    console.error("Failed to fetch gig details:\n", response.status);
                }
            } catch (error) {
                console.error("Some error occured while fetching gig details:\n", error);
            }
        }

        fetchGigTitle();
    }, [gigId]);

    // Fetch user details
    useEffect(() => {
        const fetchUserName = async () => {
            if (!userId) return;

            try {
                const response = await fetch(`http://localhost:5000/api/user/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    // console.log(data);
                    setUsername(data.user.username);
                }
                else {
                    console.error("Failed to fetch gig title:\n", response.status);
                }
            } catch (error) {
                console.error("Some error occured while fetching gig title:\n", error);
            }
        }

        fetchUserName();
    }, [userId]);

    const redirectToChat = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/conversations/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                console.log(data)
                navigate(`/messages/${data._id}`);
            }
            else {
                console.error('Failed to fetch conversationId:', response.status);
            }
        } catch (error) {
            console.error('Some error occured while fetching conversationId', error);
        }
    }

    const [orderFiles, setOrderFiles] = useState([]);
    const [isUploading, setIsUploading] = useState(false);

    const uploadFilesHandler = (event) => {
        const files = Array.from(event.target.files);
        let numberOfFiles = files.length;

        if (numberOfFiles === 0) return;

        setIsUploading(true);

        const newFiles = [];

        const processFileHandler = (file, dataUrl) => {
            const newFile = {
                id: Date.now() + Math.random(),
                name: file.name,
                type: file.type,
                size: file.size,
                dataUrl: dataUrl,
                originalFile: file
            };
            newFiles.push(newFile);

            numberOfFiles--;

            if (numberOfFiles === 0) {
                setOrderFiles(prev => [...prev, ...newFiles]);
                setIsUploading(false);
            }
        }

        files.forEach(file => {
            const reader = new FileReader();

            reader.onload = (e) => {
                processFileHandler(file, e.target.result);
            };

            reader.onerror = () => {
                console.error('Error reading files:', file.name);
                numberOfFiles--;
                if (numberOfFiles === 0) setIsUploading(false);
            };

            reader.readAsDataURL(file);
        });

        event.target.value = null;
    }

    // console.log("NEW RAW FILES:\n", orderFiles);

    const deleteFileHandler = (fileId) => {
        setOrderFiles(prev => prev.filter(file => file.id !== fileId));
    }

    const FilePreview = ({ file }) => {
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');
        const isAudio = file.type.startsWith('audio/');

        if (isImage) {
            return (
                <img src={file.dataUrl} alt={file.name} />
            )
        }
        else if (isVideo) {
            return (
                <div className='video_icon'>
                    <FontAwesomeIcon icon="fa-solid fa-video" />
                </div>
            )
        }
        else if (isAudio) {
            return (
                <div className="audio_icon">
                    <FontAwesomeIcon icon="fa-solid fa-microphone" />
                </div>
            )
        }
        else {
            return (
                <div className="file_icon">
                    <FontAwesomeIcon icon="fa-solid fa-file" />
                </div>
            )
        }
    }

    const FilePreview2 = ({ file }) => {
        const isImage = file.fileType.startsWith('image/');
        const isVideo = file.fileType.startsWith('video/');
        const isAudio = file.fileType.startsWith('audio/');

        if (isImage) {
            return (
                <img src={file.url} alt={file.fileName} />
            )
        }
        else if (isVideo) {
            return (
                <div className='video_icon'>
                    <FontAwesomeIcon icon="fa-solid fa-video" />
                </div>
            )
        }
        else if (isAudio) {
            return (
                <div className="audio_icon">
                    <FontAwesomeIcon icon="fa-solid fa-microphone" />
                </div>
            )
        }
        else {
            return (
                <div className="file_icon">
                    <FontAwesomeIcon icon="fa-solid fa-file" />
                </div>
            )
        }
    }

    const uploadToS3 = async (file, token) => {
        const response = await fetch(`http://localhost:5000/api/upload/presign?fileName=${file.name}&fileType=${file.type}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: "Presigne URL request failed!" }))
            console.error("Presign URL fetch error:", errorData.message);
            throw new Error("Failed to get S3 upload link!");
        }

        const { uploadURL, fileURL } = await response.json();

        await fetch(uploadURL, {
            method: 'PUT',
            headers: { "Content-Type": file.type },
            body: file
        });

        return fileURL;
    }

    const [deliveryNote, setDeliveryNote] = useState('');

    // For delivery note textarea
    const handleChange = (e) => {
        setDeliveryNote(e.target.value);
    }

    const deliverOrder = async () => {
        let uploadFileUrls = [];

        for (const file of orderFiles) {
            try {
                const url = await uploadToS3(file.originalFile, token);
                uploadFileUrls.push({
                    url,
                    name: file.originalFile.name,
                    type: file.originalFile.type,
                    size: file.originalFile.size
                });
            } catch (error) {
                alert("Failed to fetch s3 url for file!");
                console.error(error)
                return;
            }
        }

        try {
            const response = await fetch(`http://localhost:5000/api/orders/${id}/deliver`, {
                method: 'PATCH',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    deliveryFiles: uploadFileUrls,
                    sellerNote: deliveryNote
                })
            });

            if (response.ok) {
                const data = await response.json();
                alert(data?.message || 'Order delivered');
            }
            else {
                console.error(`Failed to deliver the order\nBackend response status: ${response.status}\nResponse Text: ${response.statusText}`);
            }

        } catch (error) {
            console.error("Some error occured while updating order's status or sending the order.\n", error);
        }
    }

    // console.log("Order detials:\n", order);

    const downloadFile = async (file) => {
        const response = await fetch(file.url);
        const blob = await response.blob();
        const blobURL = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = blobURL;
        link.download = file.fileName;

        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);

        window.URL.revokeObjectURL(blobURL);
    };

    return (
        <div className='order-container'>
            <div className="order">
                <div className="order-back-button">
                    <span>
                        <Link to='/orders' className='link'>
                            <FontAwesomeIcon icon="fa-solid fa-arrow-left" /> Orders
                        </Link>
                    </span>
                </div>
                <div className="order-title">

                    <div className="order-title-preview">
                        <img src={coverImage} alt="" />
                    </div>
                    <div className="order-title-info">
                        <div>
                            <span className='order-title-info-gig-name'>{gigTitle}</span>
                            <br />
                            <span>
                                {
                                    user.role === 'seller' ?
                                        `Buyer Name: ${username}`
                                        :
                                        `Seller Name: ${username}`
                                }
                            </span>
                        </div>
                    </div>
                    <div className='order-title-status'>
                        <span>STATUS: {order?.status}</span>
                    </div>
                </div>
                <div className="order-desc">
                    <div className="order-desc-attr">
                        <table>
                            <tbody>
                                <tr>
                                    <td><span className='order-attr'>Order ID:</span></td>
                                    <td><span>{order?._id}</span></td>
                                </tr>
                                <tr>
                                    <td><span className='order-attr'>Ordered On:</span></td>
                                    <td><span>{finalCreatedDate}</span></td>
                                </tr>
                                <tr>
                                    <td><span className='order-attr'>Price:</span></td>
                                    <td><span>₹{order?.price}</span></td>
                                </tr>
                            </tbody>
                        </table>

                        <div className="order-status">
                            <span className='order-status-title'>Order Status:</span>
                            <div className='order-status-items'>
                                <span>ACTIVE </span>
                                <span>--- DELIVERED </span>
                                <span>--- COMPLETED</span>
                            </div>
                            <div className="order-action">
                                {
                                    order?.status === 'active' && user.role === 'seller' &&
                                    (
                                        <>
                                            <input type="file" id='order-upload-file' onChange={uploadFilesHandler} className='order-upload-file-input' multiple accept='image/*, video/*, audio/*, .pdf, .doc, .docx, .zip' disabled={isUploading} />

                                            <label htmlFor='order-upload-file' className='order-upload-file-button'>
                                                Upload Files
                                            </label>

                                            <br />


                                            <div className='order-file-preview-container'>
                                                {
                                                    isUploading && (
                                                        <span>Loading File Preview</span>
                                                    )
                                                }

                                                <div className={`order-file-preview ${orderFiles.length > 0 && 'contains'}`}>
                                                    {
                                                        orderFiles.length === 0 ?
                                                            (
                                                                <span>No files uploaded yet</span>
                                                            )
                                                            :
                                                            (
                                                                orderFiles.map(file => (
                                                                    <div key={file.id} className='order-file'>
                                                                        <FilePreview file={file} />
                                                                        <div>
                                                                            <span title={file.name}>{file.name}</span>
                                                                            <br />
                                                                            <span>{formatBytesToSize(file.size)}</span>
                                                                        </div>

                                                                        <button onClick={() => deleteFileHandler(file.id)} className='delete-img-button'>
                                                                            <FontAwesomeIcon icon="fa-solid fa-trash" />
                                                                        </button>
                                                                    </div>
                                                                ))
                                                            )
                                                    }
                                                </div>
                                            </div>

                                            <label htmlFor="seller-delivery-msg-box">Delivery note:</label>
                                            <textarea name="delivery-msg" id="seller-delivery-msg-box" value={deliveryNote} onChange={handleChange} ></textarea>
                                            <br />

                                            <button onClick={deliverOrder}>Deliver Work</button>
                                        </>
                                    )
                                }
                                {
                                    order?.status === 'active' && user.role === 'buyer' &&
                                    <div>
                                        <span>Seller has not delivered the order yet.</span>
                                    </div>
                                }
                                {
                                    order?.status === 'delivered' &&
                                    <div className="order-complete">
                                        <table>
                                            <tbody>
                                                <tr>
                                                    <td><span>Delivered On: </span></td>
                                                    <td><span>{finalUpdatedDate}</span></td>
                                                </tr>
                                                {
                                                    user.role === 'buyer' &&
                                                    <>
                                                        <tr>
                                                            <td><span>Message:</span></td>
                                                            <td><span>{order?.sellerNote !== '' ? order?.sellerNote : 'Note is empty'}</span></td>
                                                        </tr>
                                                        <tr>
                                                            <td>
                                                                <span>Files: </span>
                                                            </td>
                                                            <td>
                                                                <div className="delivered-files">
                                                                    {
                                                                        order?.deliveryFiles.map((file, index) => (
                                                                            <div key={index} className='delivered-file'>
                                                                                <FilePreview2 file={file} />
                                                                                <div className='delivered-file-info'>
                                                                                    <div className='delivered-file-name'>
                                                                                        <span>{file.fileName}</span>
                                                                                    </div>
                                                                                    <div className='delivered-file-size'>
                                                                                        <span>{formatBytesToSize(file.fileSize)}</span>
                                                                                    </div>
                                                                                </div>
                                                                                <button onClick={() => downloadFile(file)} className='deliver-file-button'>
                                                                                    <FontAwesomeIcon icon="fa-regular fa-circle-down" />
                                                                                </button>
                                                                            </div>
                                                                        ))
                                                                    }
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </>
                                                }
                                                <tr>
                                                    <td>
                                                        {
                                                            user.role === 'buyer' ?
                                                                <button>Accept Order</button>
                                                                :
                                                                <span>Waiting for buyer's approval...</span>
                                                        }
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                }
                                {/* Seller && status = active */}

                                {/* Buyer && status = active */}

                                {/* Buyer|Seller && status = delivered */}

                                <div className='order-open-chat-button'>
                                    <button onClick={redirectToChat}>Open Chat <FontAwesomeIcon icon="fa-solid fa-comment" /></button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
