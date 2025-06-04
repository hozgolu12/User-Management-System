import  { useState,useEffect } from 'react';
import axios from 'axios';
import {useNavigate, useParams} from 'react-router-dom';
import {toast} from 'react-hot-toast';

const Update = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: ''
  });
  const navigate=useNavigate();
  const { id } = useParams();
  console.log(id);
  useEffect(() => {
    axios.get(`http://localhost:8000/api/user/${id}`)
      .then((response) => {
        setFormData(response.data.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [id]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };


  const handleSubmit = (e) => {
    e.preventDefault();

    
    if (!validateEmail(formData.email)) {
      toast.error("Invalid email address", { position: 'top-right' });
      return;
    }

    
    axios.put(`http://localhost:8000/api/update/user/${id}`, formData)
    .then((response)=>{
      toast.success(response.data.Message,{position:'top-right'});
    })
    .catch((error)=>{console.error(error);})
    setFormData({ name: '', email: '', address: '' });
    navigate('/');
  };

  const handleBack = () => {
    navigate('/'); 
  };

  return (
    <div className="w-full max-w-md mx-auto p-8">
      <h3 className="text-2xl font-semibold text-gray-800 mb-6">Update User</h3>
      <div className="px-6 py-4 bg-gray-50 text-right">
      <button
        type="button"
        className="w-full inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        onClick={handleBack}
      >
        Back
      </button>
      </div>
      <form 
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-lg overflow-hidden"
      >
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label 
              htmlFor="name" 
              className="block text-sm font-medium text-gray-700"
            >
              Name:
            </label>
            <input 
              type="text" 
              name="name" 
              id="name" 
              value={formData.name}
              onChange={handleChange}
              autoComplete="off" 
              placeholder="Enter your name" 
              required 
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none text-gray-900 placeholder:text-gray-400"
            />
          </div>
          
          <div className="space-y-2">
            <label 
              htmlFor="email" 
              className="block text-sm font-medium text-gray-700"
            >
              Email:
            </label>
            <input 
              type="email" 
              name="email" 
              id="email" 
              value={formData.email}
              onChange={handleChange}
              autoComplete="off" 
              placeholder="Enter your email" 
              required 
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none text-gray-900 placeholder:text-gray-400" 
            />
          </div>
          
          <div className="space-y-2">
            <label 
              htmlFor="address" 
              className="block text-sm font-medium text-gray-700"
            >
              Address:
            </label>
            <input 
              type="text" 
              name="address" 
              id="address" 
              value={formData.address}
              onChange={handleChange}
              autoComplete="off" 
              placeholder="Enter your address" 
              required 
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none text-gray-900 placeholder:text-gray-400" 
            />
          </div>
        </div>
        
        <div className="px-6 py-4 bg-gray-50 text-right">
          <button 
            type="submit" 
            className="w-full inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default Update;