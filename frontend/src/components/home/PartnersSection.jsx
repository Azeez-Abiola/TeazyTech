import { Fragment } from "react";
import partnersData from "../../lib/partnersData";

const PartnersSection = () => (
    <section className="tt-partners">
        <div className="container-wide">
            <p className="tt-partners__title">Our Partners &amp; Supporters</p>
            <div className="tt-partners__inner">
                {partnersData.map((partner, i) => (
                    <Fragment key={partner.name}>
                        {i > 0 && (
                            <span
                                className="tt-partners__sep"
                                aria-hidden="true"
                            />
                        )}
                        <span className="tt-partners__name">
                            {partner.name}
                        </span>
                    </Fragment>
                ))}
            </div>
        </div>
    </section>
);

export default PartnersSection;
