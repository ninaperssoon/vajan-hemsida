import React from "react";

function Contact () {
    return (
        <div className="container album-container">
            <h1 className="mt-5">Kontakt</h1>
            <div className="row">
                <div className="col-md-6">
                    <h3 className="my-3">Email</h3>
                    <p className="info-text">
                        Ordförande "FörstRen":
                    </p>
                    <a className="info-text" href= "mailto: forstren.vajan@gmail.com">
                        forstren.vajan@gmail.com
                    </a>
                    <p className="info-text mt-5">
                        Informationsansvarig "SiRen":
                    </p>
                    <a className="info-text" href= "mailto: siren.vajan@gmail.com">
                        siren.vajan@gmail.com
                    </a>
                    <p className="info-text mt-5">
                        Ekonomiansvarig "RenRaka":
                    </p>
                    <a className="info-text" href= "mailto: renrakavajan@gmail.com">
                        renrakavajan@gmail.com
                    </a>
                </div>
                <div className="col-md-6">
                    <h3 className="my-3 mt-5 mt-sm-3">Facebook</h3>
                    <p className="info-text">
                        Facebookgruppen <a className="info-text" href="https://www.facebook.com/groups/hbfvajan">Vajan</a>
                    </p>

                    <h3 className="mt-5 mb-3">Instagram</h3>
                    <p className="info-text">
                        <a className="info-text" href="https://www.instagram.com/hbf_vajan/">@hbf_vajan</a>
                    </p>

                    <h3 className="mt-5 mb-3">Adress</h3>
                    <p className="info-text">Norrlands nation</p>
                    <p className="info-text">Västra Ågatan 14</p>
                    <p className="info-text">753 09 Uppsala</p>

                </div>

            </div>
        </div>
    )
}

export default Contact;