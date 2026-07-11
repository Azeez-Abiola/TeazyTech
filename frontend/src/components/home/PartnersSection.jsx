import partnersData from "../../lib/partnersData";

const PartnersSection = () => (
    <section className="tt-partners">
        <div className="container-wide">
            <p className="tt-partners__title">Our Partners &amp; Supporters</p>
            <div className="tt-partners__inner">
                {partnersData.map((partner) => (
                    <span key={partner.id} className="tt-partners__item">
                        {partner.logo ? (
                            <img
                                src={partner.logo}
                                alt={partner.name}
                                className="tt-partners__logo"
                            />
                        ) : (
                            <span className="tt-partners__name">
                                {partner.name}
                            </span>
                        )}
                    </span>
                ))}
            </div>
        </div>
    </section>
);

export default PartnersSection;
