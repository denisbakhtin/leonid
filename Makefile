#Basic makefile

default: build

build: clean vet
	@go build -o leonid

doc:
	@godoc -http=:6060 -index

lint:
	@golint ./...

debug: clean
	@reflex -c reflex.conf

run: build
	./leonid

test:
	@go test ./...

vet:
	@go vet ./...

clean:
	@rm -f ./leonid
