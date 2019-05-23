
function makeReviewForm(obj) {

    let reviewHtml = ` 
    <div class="popup  review-popup">
       <div class="popup-form-wrapper">
            <form>
                <div class="input-wrapper">
                    <label>الاسم</label>
                    <input type="text" role="name" name="name" dir="rtl" placeholder=" مثال : أحمد مصري" />
                </div>

                <div class="input-wrapper">
                    <label>الهاتف</label>
                    <input type="text" role="phone" dir="rtl" name="phone" placeholder=" مثال : +97499367421" />
                </div>

                <div class="input-wrapper">
                    <label>ملاحظة</label>
                    <textarea name="note" class="note" dir="rtl"  placeholder="ما رأيك بالتجربة"></textarea>
                </div>

                <div class="input-wrapper">
                    <input type="button" class="review-btn" value="تم"  />
                </div>

                <input type="hidden" name="obj" class="hidden" value='${JSON.stringify(obj)}' />

            </form>
    </div>
</div>
`;
    let review = $(reviewHtml);

    review.appendTo("body");

    setTimeout(function () {
        review.addClass("active");
    }, 100);
}

class Holder {

    startPointRef;
    endPointRef;
    lineRef;
    constructor(startPointRef, endPointRef, lineRef) {
        this.startPointRef = startPointRef;
        this.endPointRef = endPointRef;

        this.lineRef = lineRef;
    }
    setStartPoint({ x, y }) {


        $(this.startPointRef).attr('cx', x);
        $(this.startPointRef).attr('cy', y);

        $(this.lineRef).attr("x1", x);
        $(this.lineRef).attr("y1", y);


        $(this.lineRef).attr("x2", x);
        $(this.lineRef).attr("y2", y);


    }

    setEndPoint({ x, y }) {


        $(this.lineRef).attr("x2", x);
        $(this.lineRef).attr("y2", y);

        $(this.endPointRef).attr("cx", x);
        $(this.endPointRef).attr("cy", y);

    }

    clear() {

        let x = 10000;
        let y = 10000;


        $(this.startPointRef).attr('cx', x);
        $(this.startPointRef).attr('cy', y);



        $(this.endPointRef).attr('cx', x);
        $(this.endPointRef).attr('cy', y);


        $(this.lineRef).attr("x1", x);
        $(this.lineRef).attr("y1", y);


        $(this.lineRef).attr("x2", x);
        $(this.lineRef).attr("y2", y);

    }

}

class Trip {

    startPoint;
    endPoint;
    svg;
    startPointRef;
    endPointRef;
    lineRef;
    lineOverlayRef;
    characterRef;
    arrowRef;
    timeLine;
    controllerRef;
    elapsedTime = 0;
    totalTime = 0;
    startCity;
    endCity;
    time;
    deliveryGay;
    color;

    // constants 


    timeFactor = 0.05;


    constructor({ svg, startPoint, endPoint, startCity, endCity, color, time, deliveryGay }) {
        this.svg = svg;
        this.startPoint = startPoint;
        this.endPoint = endPoint;
        this.startCity = startCity;
        this.endCity = endCity;
        this.color = color;
        this.time = time;
        this.deliveryGay = deliveryGay;

    }


    hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    makeSVG(tag, attrs) {
        var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
        for (var k in attrs)
            el.setAttribute(k, attrs[k]);
        return el;
    }

    arrowHtml() {

        return this.makeSVG("polygon", { class: 'arrow', points: "-10.7,0 -17.1,-22.1 17.1,0 -17.1,22.1 -10.7,0 -10.7,0", fill: this.color });
    }
    startPointHtml() {


        let cx = this.startPoint.x;
        let cy = this.startPoint.y;
        return this.makeSVG("circle", { cx, cy, r: 10, class: 'trip-point', fill: this.color });
    }
    endPointHtml() {

        let cx = this.endPoint.x;
        let cy = this.endPoint.y;
        return this.makeSVG("circle", { cx, cy, r: 10, class: 'trip-point', fill: this.color });

    }


    controlPoint() {

        let x1 = this.startPoint.x;
        let y1 = this.startPoint.y;

        let x2 = this.endPoint.x;
        let y2 = this.endPoint.y;


        // mid-point of line:
        let mpx = (x1 + x2) * 0.5;
        let mpy = (y1 + y2) * 0.5;



        // angle of perpendicular to line:
        let theta = Math.atan2(y2 - y1, x2 - x1) - Math.PI / 2;

        // distance of control point from mid-point of line:
        let offset = 70;

        // location of control point:
        let c1x = mpx + offset * Math.cos(theta);
        let c1y = mpy + offset * Math.sin(theta);


        return { x: c1x, y: c1y };


    }
    curvedLine() {

        let x1 = this.startPoint.x;
        let y1 = this.startPoint.y;

        let x2 = this.endPoint.x;
        let y2 = this.endPoint.y;


        let cponit = this.controlPoint();

        let c1x = cponit.x;
        let c1y = cponit.y;


        // construct the command to draw a quadratic curve
        let curve = "M" + x1 + " " + y1 + " Q " + c1x + " " + c1y + " " + x2 + " " + y2;


        return curve;
    }
    lineHtml() {

        let curve = this.curvedLine();



        return this.makeSVG("path", {
            d: curve, "stroke-width": 7, class: 'trip-line', stroke: this.color + '70',
        });

    }


    lineOverlayHtml() {

        let curve = this.curvedLine();

        let ref = this.makeSVG("path", {
            d: curve, "stroke-width": 7, class: 'trip-line-overlay', stroke: this.color,
            "stroke-dasharray": "150%",
            "stroke-dashoffset": "150%"
        });


        let length = Math.ceil(ref.getTotalLength());

        $(ref).attr("stroke-dasharray", length);
        $(ref).attr("stroke-dashoffset", length);




        return ref;

    }


    characterHtml() {
        let node = $("#character")[0].cloneNode(true);
        $(node).removeAttr("id");

        return node;
    }

    make() {
        this.startPointRef = this.startPointHtml();
        this.endPointRef = this.endPointHtml();
        this.lineOverlayRef = this.lineOverlayHtml();
        this.lineRef = this.lineHtml();
        this.characterRef = this.characterHtml();
        this.arrowRef = this.arrowHtml();

    }
    append() {

        $(this.svg).append(
            this.startPointRef, this.endPointRef,
            this.lineRef, this.lineOverlayRef, this.characterRef
            , this.arrowRef
        );


    }

    manhattanDistance() {


        let dist = Math.abs(this.startPoint.x - this.endPoint.x) +
            Math.abs(this.startPoint.y - this.endPoint.y);

        return dist;
    }

    // time() {


    //     //return Math.ceil(this.manhattanDistance() * this.timeFactor);
    // }

    controller() {

        let controllerHtml =
            `<div class="in-delivery-item">

            <div class="close-btn">
                <img
                    src="data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!-- Generator: Adobe Illustrator 22.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 0) --%3E%3Csvg version='1.1' id='Layer_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 520.1 512' style='enable-background:new 0 0 520.1 512;' xml:space='preserve'%3E%3Cstyle type='text/css'%3E .st0%7Bfill:%23DB2709;%7D%0A%3C/style%3E%3Cpath class='st0' d='M260,5.6C121.7,5.6,9.6,117.7,9.6,256c0,138.3,112.1,250.4,250.4,250.4S510.5,394.3,510.5,256 C510.4,117.7,398.3,5.6,260,5.6z M392.4,366.3l-22.1,22.1L260,278.1L149.7,388.3l-22-22.1L238,256L127.7,145.7l22-22L260,233.9 l110.3-110.3l22.1,22L282.1,256L392.4,366.3z'/%3E%3C/svg%3E%0A" />
            </div>
        
            <div class="time-left">
                <h5 class="label">الوقت المتبقي</h5>
                <h1 class="timer">
                    03 : 23
                </h1>
            </div>
            <div class="trip-info">
                <h3>السيد احمد السودان</h3>
                <span>${this.endCity}</span> <span>${this.startCity}</span>
            </div>

        </div>

        `;

        this.controllerRef = $(controllerHtml);

        function twoDigits(number) {
            return ('0' + number).slice(-2);
        }
        function secondsToTimeSpan(seconds) {
            const value = seconds;
            const hours = Math.floor(value / 3600);
            const min = Math.floor(((value - (hours * 3600)) / 60));
            const sec = value % 60;
            return `${twoDigits(hours)} : ${twoDigits(min)} : ${twoDigits(sec)}`;
        }

        $(this.controllerRef).find(".timer").html(
            secondsToTimeSpan(this.totalTime)
        );


        $(".in-delivery-items").append(this.controllerRef);

        $(this.controllerRef).find('.close-btn').click(function () {
            this.clear();
        }.bind(this));


        this.internalRef = setInterval(function (e) {

            this.elapsedTime += 1;
            if (this.elapsedTime > this.totalTime) {
                clearInterval(this.internalRef);
            } else {
                let t = this.totalTime - this.elapsedTime;
                $(this.controllerRef).find(".timer").html(
                    secondsToTimeSpan(t)
                );

            }
        }.bind(this), 1000);




    }

    clear() {

        this.timeLine.kill();

        $([this.startPointRef, this.endPointRef,
        this.lineRef, this.lineOverlayRef, this.characterRef
            , this.arrowRef]).remove();
        this.controllerRef.remove();

        clearInterval(this.internalRef);
    }


    movePoint(point, angle, length) {

        point.x += length * Math.cos(angle);
        point.y += length * Math.sin(angle);


    }
    start() {


        let time = this.time;
        this.totalTime = time;

        this.make();
        this.append();
        this.controller();

        let timeLine = new TimelineMax({ paused: true, onComplete: this.onComplete.bind(this) });
        this.timeLine = timeLine;



        let angle = Math.atan2(- this.startPoint.y + this.endPoint.y,
            - this.startPoint.x + this.endPoint.x
        );



        let arrowOffest = 20;



        timeLine.set(this.arrowRef, {

            x: this.startPoint.x + arrowOffest * Math.cos(angle),
            y: this.startPoint.y + arrowOffest * Math.sin(angle),


        });




        timeLine.set([this.arrowRef], {

            transformOrigin: "50% 50%",
            rotation: angle + 'rad'

        });


        timeLine.to(this.lineOverlayRef, time, {

            attr: {
                "stroke-dashoffset": 0
            }
        });




        let controlPoint = this.controlPoint();



        timeLine.to(this.arrowRef, time, {

            bezier: {
                type: "quadratic",
                values: [this.startPoint, controlPoint, this.endPoint]
                , autoRotate: true
            }

        }, 0);

        timeLine.set(this.characterRef, {

            transformOrigin: "0% 0%",
            rotation: angle + 'rad'

        }, 0);



        let characterStartPoint = { ...this.startPoint };
        let characterEndPoint = { ...this.endPoint };
        let characterControlPoint = { ...controlPoint };

        // offset for Perpendiuclar vector 
        let characterPerpendicularOffest = -110;


        this.movePoint(characterStartPoint, angle + Math.PI / 2, characterPerpendicularOffest);
        this.movePoint(characterEndPoint, angle + Math.PI / 2, characterPerpendicularOffest);
        this.movePoint(characterControlPoint, angle + Math.PI / 2, characterPerpendicularOffest);


        // offset for direction vector 
        let characterOffest = -50;

        this.movePoint(characterStartPoint, angle, characterOffest);
        this.movePoint(characterEndPoint, angle, characterOffest);
        this.movePoint(characterControlPoint, angle, characterOffest);




        if ((angle <= -Math.PI / 2 && angle >= -Math.PI) || (angle >= Math.PI / 2 && angle <= Math.PI)) {

            timeLine.set(this.characterRef, {
                scaleY: -1,
                transformOrigin: "50% 50%",
            }, 0);
            characterStartPoint = { ...this.startPoint };
            characterEndPoint = { ...this.endPoint };
            characterControlPoint = { ...controlPoint };


            let characterPerpendicularOffest = 5;
            // offset for Perpendiuclar vector 
            this.movePoint(characterStartPoint, angle + Math.PI / 2, characterPerpendicularOffest);
            this.movePoint(characterEndPoint, angle + Math.PI / 2, characterPerpendicularOffest);
            this.movePoint(characterControlPoint, angle + Math.PI / 2, characterPerpendicularOffest);


            // offset for direction vector 
            this.movePoint(characterStartPoint, angle, characterOffest);
            this.movePoint(characterEndPoint, angle, characterOffest);
            this.movePoint(characterControlPoint, angle, characterOffest);

        }




        timeLine.fromTo(this.characterRef, time,


            {
                x: characterStartPoint.x,
                y: characterStartPoint.y
            },
            {

                bezier: {
                    type: "quadratic",
                    values: [
                        characterStartPoint,
                        characterControlPoint,
                        characterEndPoint]
                    , autoRotate: true

                }
            }, 0);




        timeLine.play(0);

    }




    onComplete() {

        delete this.timeLine;
        delete this.svg;

        makeReviewForm(this);

    }

}


$(function () {

    let holder = new Holder($("#holder-start"), $("#holder-end"), $("#holder-line"));

    let svg = $(".svg")[0];
    let context = $("#context");
    let point1 = null;
    let point2 = null;
    let city1 = "";
    let city2 = "";




    function createTrip() {

        let color = $("#color").val().toString();
        let deliveryGay = $("#delivery-gay").val();

        let time = parseInt($("#animation-time-second").val());
        time += parseInt($("#animation-time-minute").val()) * 60;
        time += parseInt($("#animation-time-hour").val()) * 60 * 60;
        let trip = new Trip({ svg: context, startPoint: point1, endPoint: point2, startCity: city1, endCity: city2, color, deliveryGay, time });

        trip.start();

    }
    function convertPoint({ x, y }) {
        let pt = svg.createSVGPoint(), svgP;
        pt.x = x;
        pt.y = y;
        svgP = pt.matrixTransform(svg.getCTM().inverse());
        return { x: svgP.x, y: svgP.y };
    }



    function clearTripForm() {
        $("#trip-form-popup").removeClass("active");

        point1 = null;
        point2 = null;
    }

    function showTripForm() {
        $("#trip-form-popup").addClass("active");

    }

    $("#trip-form-btn").click(function () {

        createTrip();
        clearTripForm();
    });
    $("#trip-form-popup").click(function (e) {
        if (e.target !== this) return true;
        clearTripForm();
    });

    function setPoints(point, city) {

        if (!point1) {
            point1 = point;
            city1 = city;
            holder.setStartPoint(point);
        } else {
            city2 = city;
            point2 = point;
            showTripForm();
            holder.clear();
        }
    }
    // popup events 


    $("body").on("click", ".review-btn", function () {
        let popup = $(this).parents('.popup')[0];

        let form = $(popup).find('form')[0];

        let toDownload = $(form).serializeArray();
        console.log(toDownload);

        $(popup).remove();

    });

    // register events 
    $("#context").click((e) => {

        let point = convertPoint({ x: e.offsetX, y: e.offsetY });

        let city = "Doha";
        for (let clickedItem of e.originalEvent.path) {

            if ($(clickedItem).hasClass("region")) {
                city = $(clickedItem).data("region");
                break;
            }
        }
        setPoints(point, city);


    });

    $("#context").mousemove((e) => {
        if (point1) {
            let point = convertPoint({ x: e.offsetX, y: e.offsetY });
            holder.setEndPoint(point);
        }
    });


}); 