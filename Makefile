VERSION=latest

docker-build:
	docker build -t ghcr.io/nysa-network/cosmos-tower:$(VERSION) .
	docker push ghcr.io/nysa-network/cosmos-tower:$(VERSION)
