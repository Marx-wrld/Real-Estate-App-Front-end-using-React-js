import { useState } from 'react';
import { getStorage, uploadBytesResumable } from 'firebase/storage';
import { app } from '../firebase';
import { getDownloadURL } from 'firebase/storage';
import { ref } from 'firebase/storage';

const CreateListing = () => {
const [files, setFiles] = useState([]);
const [formData, setFormData] = useState({
    imageUrls: [],
});
const [imageUploadError, setImageUploadError] = useState(false);
const handleImageSubmit = (e) => {
    if (files.length > 0 && files.length + formData.imageUrls.length < 7) {
        const promises = []; //Uploading more than one image hence promises

        for (let i = 0; i < files.length; i++) {
            promises.push(storeImage(files[i]));
        }
        Promise.all(promises).then((urls) => {
            setFormData({ ...formData, imageUrls: formData.imageUrls.concat(urls)}); //helps to keep the previous images and only add new urls to previous
            setImageUploadError(false);
        }).catch((err) => {
            console.log(err);
            setImageUploadError('Image upload failed. Please try again!');
        
        });
    } else {
        setImageUploadError('You can only upload 6 images max. per listing!');
    }
}

const storeImage = async (file) => {
    return new Promise((resolve, reject) => {
        const storage = getStorage(app);
        const fileName = new Date().getTime() + file.name;
        const storageRef = ref(storage, fileName);
        const uploadTask = uploadBytesResumable(storageRef, file);
        uploadTask.on(
            "state_changed",
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log(`Upload is ${progress}% done`);
                switch (snapshot.state) {
                    case "paused":
                        console.log("Upload is paused");
                        break;
                    case "running":
                        console.log("Upload is running");
                        break;
                }
            },
            (error) => {
                reject(error);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    console.log("File available at", downloadURL);
                    resolve(downloadURL);
                });
            }
        )
    });
}

  return (
    <main className="p-3 max-w-4xl mx-auto">
        <h1 className="text-3xl font-semibold text-center mb-6 mt-3">
            Create a Listing
        </h1>
        <form className="flex flex-col sm:flex-row gap-4" action="">
            <div className="flex flex-col gap-4 flex-1">
                <input type="text" placeholder="Name" className="border p-3 rounded-lg" id="name" maxLength='62' minLength='10' required />

                <textarea type="text" placeholder="Description" className="border resize-none p-3 rounded-lg" id="description" required />

                <input type="text" placeholder="Address" className="border p-3 rounded-lg" id="address" required />

                <div className="flex gap-6 flex-wrap">

                <div className="flex gap-2">
                    <input type="checkbox" id="sale" className="w-5" checked />
                    <span>Sell</span>
                </div>

                <div className="flex gap-2">
                    <input type="checkbox" id="rent" className="w-5" />
                    <span>Rent</span>
                </div>

                <div className="flex gap-2">
                    <input type="checkbox" id="parking" className="w-5" />
                    <span>Parking spot</span>
                </div>

                <div className="flex gap-2">
                    <input type="checkbox" id="furnished" className="w-5" />
                    <span>Furnished</span>
                </div>

                <div className="flex gap-2">
                    <input type="checkbox" id="offer" className="w-5" />
                    <span>Offer</span>
                </div>

                </div>

                <div className="flex flex-wrap gap-6">
                    <div className="flex items-center gap-2">
                        <input type="number" id="bedrooms" min='1' max='10' className="p-3 border border-gray-300 rounded-lg" required/>
                        <p>Beds</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <input type="number" id="bathrooms" min='1' max='10' className="p-3 border border-gray-300 rounded-lg" required/>
                        <p>Baths</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <input type="number" id="regularPrice" min='50'max='10000000' className="p-3 border border-gray-300 rounded-lg" required/>
                        <div className="flex flex-col items-center">
                            <p>Regular price</p>
                            <span className="text-xs">($ /month)</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <input type="number" id="discountPrice" min='0'max='10000000' className="p-3 border border-gray-300 rounded-lg" required/>
                        <div className="flex flex-col items-center">
                            <p>Discounted price</p>
                            <span className="text-xs">($ /month)</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col flex-1 gap-4">
                <p className="font-semibold">Images:
                <span className="font-normal text-gray-600 ml-2">The first image will be the cover (max 6)</span>
                </p>
                <div className="flex gap-4">
                    <input onChange={(e) => setFiles(e.target.files)} className="p-3 border border-gray-300 rounded w-full" type="file" id="images" accept="image/*" multiple />
                    <button type='button' onClick={handleImageSubmit} className="p-3 text-green-700 border border-green-700 rounded uppercase hover:shadow-lg disabled:opacity-80">Upload</button>
                </div>
                <p className='text-red-600'>{imageUploadError && imageUploadError}</p>
                {
                    formData.imageUrls.length > 0 && formData.imageUrls.map((url) => (
                        <div key={url} className='flex justify-between p-3 border items-center'>
                            <img src={url} alt="listing image" className="w-20 h-20 object-contain rounded-lg" />
                            <button className='p-3 text-red-600 rounded-lg uppercase hover:opacity-75'>Delete</button>
                        </div>
                    ))
                }
                <button className="p-3 bg-slate-700 text-white rounded-lg mt-4 uppercase hover:opacity-95 disabled:opacity-80">Create Listing</button>
            </div>
        </form>
    </main>
  )
}

export default CreateListing