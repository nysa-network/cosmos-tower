FROM node:18-alpine as builder

COPY . /app

WORKDIR /app

RUN yarn install --dev

RUN yarn run build-alpine

FROM alpine

COPY --from=builder /app/cosmos-tower /usr/bin/cosmos-tower

ENTRYPOINT [ "/usr/bin/cosmos-tower" ]

CMD [ "start", "cosmos-tower" ]
