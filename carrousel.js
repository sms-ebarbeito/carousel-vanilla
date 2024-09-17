const cardsContainer = document.querySelector(".card-carousel");
const cardsController = document.querySelector(".card-carousel + .card-controller")

class DraggingEvent {
    constructor(target = undefined) {
        this.target = target;
    }

    event(callback) {
        let handler;

        this.target.addEventListener("mousedown", e => {
            e.preventDefault()

            handler = callback(e)

            window.addEventListener("mousemove", handler)

            document.addEventListener("mouseleave", clearDraggingEvent)

            window.addEventListener("mouseup", clearDraggingEvent)

            function clearDraggingEvent() {
                window.removeEventListener("mousemove", handler)
                window.removeEventListener("mouseup", clearDraggingEvent)

                document.removeEventListener("mouseleave", clearDraggingEvent)

                handler(null)
            }
        })

        this.target.addEventListener("touchstart", e => {
            handler = callback(e)

            window.addEventListener("touchmove", handler)

            window.addEventListener("touchend", clearDraggingEvent)

            document.body.addEventListener("mouseleave", clearDraggingEvent)

            function clearDraggingEvent() {
                window.removeEventListener("touchmove", handler)
                window.removeEventListener("touchend", clearDraggingEvent)

                handler(null)
            }
        })
    }

    // Get the distance that the user has dragged
    getDistance(callback) {
        function distanceInit(e1) {
            let startingX, startingY;

            if ("touches" in e1) {
                startingX = e1.touches[0].clientX
                startingY = e1.touches[0].clientY
            } else {
                startingX = e1.clientX
                startingY = e1.clientY
            }


            return function(e2) {
                if (e2 === null) {
                    return callback(null)
                } else {

                    if ("touches" in e2) {
                        return callback({
                            x: e2.touches[0].clientX - startingX,
                            y: e2.touches[0].clientY - startingY
                        })
                    } else {
                        return callback({
                            x: e2.clientX - startingX,
                            y: e2.clientY - startingY
                        })
                    }
                }
            }
        }

        this.event(distanceInit)
    }
}


class CardCarousel extends DraggingEvent {
    constructor(container, controller = undefined) {
        super(container)

        this.highlightedId = 1;

        // DOM elements
        this.container = container
        this.controllerElement = controller
        this.cards = container.querySelectorAll(".card")

        // Carousel data
        this.centerIndex = (this.cards.length - 1) / 2;
        this.cardWidth = this.cards[0].offsetWidth / this.container.offsetWidth * 100
        this.xScale = {};

        // Resizing
        window.addEventListener("resize", this.updateCardWidth.bind(this))

        if (this.controllerElement) {
            this.controllerElement.addEventListener("keydown", this.controller.bind(this))
        }


        // Initializers
        this.build()

        // Bind dragging event
        super.getDistance(this.moveCards.bind(this))
    }

    updateCardWidth() {
        this.cardWidth = this.cards[0].offsetWidth / this.container.offsetWidth * 100

        this.build()
    }

    build(fix = 0) {
        for (let i = 0; i < this.cards.length; i++) {
            const x = i - this.centerIndex;
            const scale = this.calcScale(x)
            const scale2 = this.calcScale2(x)
            const zIndex = -(Math.abs(i - this.centerIndex))

            const leftPos = this.calcPos(x, scale2)


            this.xScale[x] = this.cards[i]

            this.updateCards(this.cards[i], {
                x: x,
                scale: scale,
                leftPos: leftPos,
                zIndex: zIndex
            })
        }
    }


    controller(e) {
        const temp = {...this.xScale};

        if (e.keyCode === 39) {
            // Left arrow
            for (let x in this.xScale) {
                const newX = (parseInt(x) - 1 < -this.centerIndex) ? this.centerIndex : parseInt(x) - 1;

                temp[newX] = this.xScale[x]
            }
        }

        if (e.keyCode == 37) {
            // Right arrow
            for (let x in this.xScale) {
                const newX = (parseInt(x) + 1 > this.centerIndex) ? -this.centerIndex : parseInt(x) + 1;

                temp[newX] = this.xScale[x]
            }
        }

        this.xScale = temp;

        for (let x in temp) {
            const scale = this.calcScale(x),
                scale2 = this.calcScale2(x),
                leftPos = this.calcPos(x, scale2),
                zIndex = -Math.abs(x)

            this.updateCards(this.xScale[x], {
                x: x,
                scale: scale,
                leftPos: leftPos,
                zIndex: zIndex
            })
        }
    }

    calcPos(x, scale) {
        let formula;

        if (x < 0) {
            formula = (scale * 100 - this.cardWidth) / 2

            return formula

        } else if (x > 0) {
            formula = 100 - (scale * 100 + this.cardWidth) / 2

            return formula
        } else {
            formula = 100 - (scale * 100 + this.cardWidth) / 2

            return formula
        }
    }

    updateCards(card, data) {
        const sizeHighlighted = 1; //Esto es el tamaño del icono central
        if (data.x || data.x == 0) {
            card.setAttribute("data-x", data.x)
        }
        //Aca se actualiza el tamaño del icono central el que va HIGHLIGHTED
        //console.log(calc);
        //if (data.scale || data.scale == 0) {
        card.style.transform = card.classList.contains("highlight") ? `scale(${sizeHighlighted})` : `scale(${data.scale})`
            // if (card.classList.contains("highlight")) {
            //     document.querySelector(".top-image").id = card.id;
            // }
        //    if (data.scale == 0) {
        //        card.style.opacity = data.scale
        //    } else {
        //        card.style.opacity = 1;
        //    }
        //}

        if (data.leftPos) {
            card.style.left = `${data.leftPos}%`
        }

        if (data.zIndex || data.zIndex === 0) {
            if (data.zIndex === 0) {
                card.classList.add("highlight")
                card.style.transform = `scale(${sizeHighlighted})`
                this.changeTopImage(card.id);
                this.changeText(card.id);
            } else {
                card.classList.remove("highlight")
            }

            card.style.zIndex = data.zIndex
        }
    }

    changeTopImage(id) {
        if (!id) return;
        const clazzList = document.querySelector(".top-image").classList;
        // if (!clazzList.contains("bg-image-" + id)) {
        //     clazzList.remove("bg-image-1");
        //     clazzList.remove("bg-image-2");
        //     clazzList.remove("bg-image-3");
        //     clazzList.remove("bg-image-4");
        //     clazzList.remove("bg-image-5");
        //     clazzList.add("bg-image-" + id);
        // } //lo de abajo hace lo mismo pero mas lindo usando una regex...
        if (!clazzList.contains("bg-image-" + id)) {
            clazzList.forEach(cls => {
                if (/^bg-image-\d+$/.test(cls)) {
                    clazzList.remove(cls);
                }
            });
            clazzList.add("bg-image-" + id);
            this.highlightedId = parseInt(id);
        }
    }

    changeText(id) {
        if (!id) return;
        const textItems = document.querySelectorAll(".text-item");
        textItems.forEach(textItem => {
            if (textItem.classList.contains("text-" + id)) {
                textItem.classList.remove("hidden-text");
            } else {
                textItem.classList.add("hidden-text");
            }
        })
    }

    calcScale2(x) {
        let formula;

        if (x <= 0) {
            formula = 1 - -1 / 3 * x

            return formula
        } else if (x > 0) {
            formula = 1 - 1 / 3 * x

            return formula
        }
    }

    //Esto no se usa más devolvemos para todas 1 para que tengan el mismo tamaño
    calcScale(x) {
        const formula = 1 // - 1 / 5 * Math.pow(x, 2)

        if (formula <= 0) {
            return
        } else {
            return formula
        }
    }

    checkOrdering(card, x, xDist) {
        const original = parseInt(card.dataset.x)
        const rounded = Math.round(xDist)
        let newX = x

        if (x !== x + rounded) {
            if (x + rounded > original) {
                if (x + rounded > this.centerIndex) {

                    newX = ((x + rounded - 1) - this.centerIndex) - rounded + -this.centerIndex
                }
            } else if (x + rounded < original) {
                if (x + rounded < -this.centerIndex) {

                    newX = ((x + rounded + 1) + this.centerIndex) - rounded + this.centerIndex
                }
            }

            this.xScale[newX + rounded] = card;
        }

        const temp = -Math.abs(newX + rounded)

        this.updateCards(card, {zIndex: temp})

        return newX;
    }

    moveCards(data) {
        let xDist;

        if (data != null) {
            this.container.classList.remove("smooth-return")
            xDist = data.x / 250;
        } else {


            this.container.classList.add("smooth-return")
            xDist = 0;

            for (let x in this.xScale) {
                this.updateCards(this.xScale[x], {
                    x: x,
                    zIndex: Math.abs(Math.abs(x) - this.centerIndex)
                })
            }
        }

        for (let i = 0; i < this.cards.length; i++) {
            const x = this.checkOrdering(this.cards[i], parseInt(this.cards[i].dataset.x), xDist),
                scale = this.calcScale(x + xDist),
                scale2 = this.calcScale2(x + xDist),
                leftPos = this.calcPos(x + xDist, scale2)


            this.updateCards(this.cards[i], {
                scale: scale,
                leftPos: leftPos
            })
        }
    }
}

const carousel = new CardCarousel(cardsContainer)