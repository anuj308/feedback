// import React from 'react'

// import { useRef,useState } from 'react';

// const ProfilePicture = ({ register }) => {
//     const hiddenInputRef = useRef();
   
   
//     const [preview, setPreview] = useState();
   
   
//     const { ref: registerRef, ...rest } = register("profilePicture");
   
   
//     const handleUploadedFile = (event) => {
//       const file = event.target.files[0];
   
   
//       const urlImage = URL.createObjectURL(file);
   
   
//       setPreview(urlImage);
//     };
   
   
//     const onUpload = () => {
//       hiddenInputRef.current.click();
//     };
   
   
//     const uploadButtonLabel = 
//      preview ? "Change image" : "Upload image";
   
   
//     return (
//       <ProfilePictureContainer>
//         <Label>Profile picture</Label>
   
   
//         <HiddenInput
//           type="file"
//           name="profilePicture"
//           {...rest}
//           onChange={handleUploadedFile}
//           ref={(e) => {
//             registerRef(e);
//             hiddenInputRef.current = e;
//           }}
//         />
   
   
//         <Avatar src={preview} sx={{ width: 80, height: 80 }} />
   
   
//         <Button variant="text" onClick={onUpload}>
//           {uploadButtonLabel}
//         </Button>
   
//     </ProfilePictureContainer>
//     );
//    };


//    export default ProfilePicture