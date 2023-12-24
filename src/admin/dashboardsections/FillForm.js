import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import swal from "sweetalert";
import JashanService from "../../service/JashanService";
import { useNavigate } from "react-router-dom";
import "./FillForm.css";
import { stateCityData } from "./StateandCities";

const FillForm = ({ onEventAdded }) => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [showProgressBar, setShowProgressBar] = useState(false);
  const [eventData, setEventData] = useState({
    pricingDetails: {
      basePrice: "",
      additionalServices: [{ serviceName: "", price: "" }],
    },
    address: {
      country: "India",
      state: "",
      city: "",
      pinCode: "",
      landmark: "",
    },
    images: [],
  });
  const [error, setError] = useState(null);
  const [videoData, setVideoData] = useState({ video: null, duration: 0 });

  const handleInputChange = (
    e,
    field,
    subfield = null,
    subindex = null,
    subsubfield = null
  ) => {
    setEventData((prevData) => {
      const updatedData = { ...prevData };
      if (subfield === null) {
        updatedData[field] = e.target.value;
      } else if (subindex === null) {
        updatedData[field][subfield] = e.target.value;
      } else {
        if (subsubfield === null) {
          updatedData[field][subfield][subindex] = e.target.value;
        } else {
          updatedData[field][subfield][subindex][subsubfield] = e.target.value;
        }
      }
      return updatedData;
    });
  };

  const handleVideoChange = async (e) => {
    const selectedVideo = e.target.files[0];
    console.log("SELECTED VIDEO" + selectedVideo);

    if (selectedVideo && selectedVideo.type.startsWith("video/")) {
      setVideoData({
        video: selectedVideo,
        duration: Math.round(selectedVideo.duration),
      });
    } else {
      setError("Please select a valid video file.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append(
      "event",
      new Blob([JSON.stringify(eventData)], { type: "application/json" })
    );
    eventData.images.forEach((image) => formData.append("images", image));
    formData.append("video", videoData.video);

    const token = localStorage.getItem("admin-token");
    try {
      setShowProgressBar(true);
      const response = await JashanService.add_Event(
        formData,
        token,
        onUploadProgress
      );
      setShowProgressBar(false);
      const newEvent = response.data;
      swal({
        title: "Good job!",
        text: "You have successfully added a new event",
        icon: "success",
        button: "Aww yiss!",
      });

      setEventData({
        pricingDetails: {
          basePrice: "",
          additionalServices: [{ serviceName: "", price: "" }],
        },
        address: {
          country: "",
          state: "",
          city: "",
          pinCode: "",
          landmark: "",
        },
        images: [],
      });
      onEventAdded(newEvent);
    } catch (error) {
      setError("You are required to fill in only two events");
    }
  };

  const handleImageChange = (e) => {
    setEventData((prevData) => ({
      ...prevData,
      images: Array.from(e.target.files),
    }));
  };

  const onUploadProgress = (progressEvent) => {
    
    const { loaded, total } = progressEvent;
    const percentage = Math.round((loaded / total) * 100);
        setProgress(percentage);
  };

  const addService = () => {
    setEventData((prevData) => ({
      ...prevData,
      pricingDetails: {
        ...prevData.pricingDetails,
        additionalServices: [
          ...prevData.pricingDetails.additionalServices,
          { serviceName: "", price: "" },
        ],
      },
    }));
  };

  const removeService = (index) => {
    setEventData((prevData) => {
      const updatedData = { ...prevData };
      updatedData.pricingDetails.additionalServices.splice(index, 1);
      return updatedData;
    });
  };

  return (
    <div className="container mt-4">
      <p className="fs-3">Event Form</p>
      {showProgressBar ? (
        <div
          style={{
            width: "50%",
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "#fff",
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
            borderRadius: "4px",
            padding: "20px",
            textAlign: "center",
          }}
        >
          <p>Uploading: {progress}%</p>
          <div
            style={{
              height: "20px",
              backgroundColor: "#3498db",
              width: `${progress}%`,
              borderRadius: "4px",
            }}
          ></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="row mb-4">
            <div className="col">
              <label htmlFor="images" className="image-lable">
                Upload
              </label>
              <input
                type="file"
                id="images"
                name="images"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                required
              />
            </div>
            <div className="col">
              <div className="form-outline">
                <input
                  type="text"
                  className="form-control"
                  id="basePrice"
                  value={eventData.pricingDetails.basePrice}
                  onChange={(e) =>
                    handleInputChange(e, "pricingDetails", "basePrice")
                  }
                  required
                />
                <label className="form-label" htmlFor="basePrice">
                  Base Price
                </label>
              </div>
            </div>
          </div>

          <div className="row mb-4">
            <div className="col">
              <label htmlFor="video" className="form-label">
                Submit Cool Promo
              </label>
              <input
                type="file"
                className="form-control"
                id="video"
                name="video"
                accept="video/*"
                onChange={handleVideoChange}
              />
              <div className="form-text">
                Kindly furnish the particulars for your 30-second advertisement
                video
              </div>
            </div>
          </div>

          <div className="row mb-4">
            <div className="col">
              <input
                type="text"
                className="form-control"
                id="country"
                value={eventData.address.country}
                disable
              />
              <label className="form-label" htmlFor="country">
                Country
              </label>
            </div>

            <div className="col">
              <select
                className="form-select"
                id="state"
                value={eventData.address.state}
                onChange={(e) => handleInputChange(e, "address", "state")}
                required
              >
                <option value="">Select State</option>
                {stateCityData.map((stateData) => (
                  <option key={stateData.state} value={stateData.state}>
                    {stateData.state}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="row mb-4">
            <div className="col">
              <select
                className="form-select"
                id="city"
                value={eventData.address.city}
                onChange={(e) => handleInputChange(e, "address", "city")}
                required
              >
                <option value="">Select City</option>
                {stateCityData
                  .find(
                    (stateData) => stateData.state === eventData.address.state
                  )
                  ?.cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
              </select>
            </div>

            <div className="col">
              <input
                type="text"
                className="form-control"
                id="pinCode"
                value={eventData.address.pinCode}
                onChange={(e) => handleInputChange(e, "address", "pinCode")}
                required
              />
              <label className="form-label" htmlFor="pinCode">
                Pin Code
              </label>
            </div>
          </div>

          <div className="form-outline mb-4">
            <input
              type="text"
              className="form-control"
              id="landmark"
              value={eventData.address.landmark}
              onChange={(e) => handleInputChange(e, "address", "landmark")}
              required
            />
            <label className="form-label" htmlFor="landmark">
              Landmark
            </label>
          </div>

          <div className="form-group">
            {eventData.pricingDetails.additionalServices.map(
              (service, index) => (
                <div key={index}>
                  <div className="row mb-4">
                    <div className="col">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Service Name"
                        value={service.serviceName}
                        onChange={(e) =>
                          handleInputChange(
                            e,
                            "pricingDetails",
                            "additionalServices",
                            index,
                            "serviceName"
                          )
                        }
                        required
                      />
                      <label className="form-label" htmlFor="serviceName">
                        Service Name
                      </label>
                    </div>

                    <div className="col">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Price"
                        value={service.price}
                        onChange={(e) =>
                          handleInputChange(
                            e,
                            "pricingDetails",
                            "additionalServices",
                            index,
                            "price"
                          )
                        }
                        required
                      />
                      <label className="form-label" htmlFor="price">
                        Price
                      </label>
                    </div>
                  </div>
                  <div className="text-right">
                    <button
                      type="button"
                      className="button-no"
                      onClick={() => removeService(index)}
                    >
                      Remove Service
                    </button>
                  </div>
                </div>
              )
            )}
            <button type="button" className="button-yes" onClick={addService}>
              Add Service
            </button>
          </div>

          <button type="submit" className="button-yes">
            Submit
          </button>
          {error && <p style={{ color: "red" }}>{error}</p>}
        </form>
      )}
    </div>
  );
};

export default FillForm;
