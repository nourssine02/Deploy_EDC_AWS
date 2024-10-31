import React, { useContext, useState } from "react";
import { UserContext } from "../Connexion/UserProvider";
import { MDBCol, MDBContainer, MDBRow, MDBCard, MDBCardBody, MDBCardImage, MDBTypography, MDBIcon, MDBBtn } from 'mdb-react-ui-kit';
import axios from 'axios';

const Profile = ({ isSidebarOpen }) => {
  const { user, setUser } = useContext(UserContext);

  const [formData, setFormData] = useState({
    code_entreprise: user?.code_entreprise || "",
    code_user: user?.code_user || "",
    identite: user?.identite || "",
    position: user?.position || "",
    tel: user?.tel || "",
    email: user?.email || "",
    role: user?.role || ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.put(`https://comptaonline.line.pm/api/users/${user.id}`, formData)
      .then((res) => {
        setUser(res.data);
        alert('Profile updated successfully');
      })
      .catch((err) => {
        console.error(err);
        alert('Error updating profile');
      });
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="main-panel">
      <div className={`content-wrapper ${isSidebarOpen ? "shifted" : ""}`}>
        <section className="vh-100">
          <MDBContainer className="py-4 h-150">
            <MDBRow className="justify-content-center align-items-center h-150">
              <MDBCol lg="9" className="mb-4 mb-lg-0">
                <MDBCard className="mb-3" style={{ borderRadius: '.5rem' }}>
                  <MDBRow className="g-0">
                    <MDBCol md="4" className="text-center text-white"
                      style={{ borderTopLeftRadius: '.5rem', borderBottomLeftRadius: '.5rem',
                        background: "linear-gradient(to right bottom, rgba(246, 211, 101, 1), rgba(253, 160, 133, 1))"
                      }}>
                      <MDBCardImage src="https://cdn3.iconfinder.com/data/icons/business-avatar-1/512/11_avatar-512.png"
                        alt="Avatar" className="my-5" style={{ width: '100px' }} fluid />
                      <MDBTypography tag="h5" color="black">{formData.identite}</MDBTypography>
                      <MDBIcon far icon="edit mb-5" color="black" onClick={() => console.log("hello")} />
                    </MDBCol>
                    <MDBCol md="8">
                      <MDBCardBody className="p-4">
                        <form onSubmit={handleSubmit}>
                          <MDBTypography tag="h2">Mes Informations</MDBTypography>
                          <hr className="mt-0 mb-4" />
                          <MDBRow className="pt-1">
                            <MDBCol size="6" className="mb-3">
                              <label htmlFor="code_user">Code Utilisateur :</label>
                              <input
                                id="code_user"
                                name="code_user"
                                value={formData.code_user}
                                onChange={handleChange}
                                className="form-control"
                                style={{border: "none"}}
                              />
                            </MDBCol>
                            <MDBCol size="6" className="mb-3">
                              <label htmlFor="code_entreprise">Code Entreprise :</label>
                              <input
                                id="code_entreprise"
                                name="code_entreprise"
                                value={formData.code_entreprise}
                                onChange={handleChange}
                                className="form-control"
                                style={{border: "none"}}
                              />
                            </MDBCol>
                          </MDBRow>
                          <MDBRow className="pt-1">
                            <MDBCol size="6" className="mb-3">
                              <label htmlFor="email">Email :</label>
                              <input
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="form-control"
                                style={{border: "none"}}

                              />
                            </MDBCol>
                            <MDBCol size="6" className="mb-3">
                              <label htmlFor="tel">Telephone :</label>
                              <input
                                id="tel"
                                name="tel"
                                value={formData.tel}
                                onChange={handleChange}
                                className="form-control"
                                style={{border: "none"}}

                              />
                            </MDBCol>
                          </MDBRow>
                          <MDBRow className="pt-1">
                            <MDBCol size="6" className="mb-3">
                              <label htmlFor="position">Position :</label>
                              <input
                                id="position"
                                name="position"
                                value={formData.position}
                                onChange={handleChange}
                                className="form-control"
                                style={{border: "none"}}

                              />
                            </MDBCol>
                            <MDBCol size="6" className="mb-3">
                              <label htmlFor="role">Role :</label>
                              <input
                                id="role"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="form-control"
                                style={{border: "none"}}

                              />
                            </MDBCol>
                          </MDBRow>
                          <MDBBtn type="submit">Save Changes</MDBBtn>
                        </form>
                      </MDBCardBody>
                    </MDBCol>
                  </MDBRow>
                </MDBCard>
              </MDBCol>
            </MDBRow>
          </MDBContainer>
        </section>
      </div>
    </div>
  );
};

export default Profile;
