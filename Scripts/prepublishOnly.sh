#!/bin/bash

Build 'CodeEditorLand/Editor/src/**/*.{ts,tsx,js,jsx}' \
	--ESBuild Source/Variable/CodeEditorLand/Editor/ESBuild.clean.ts \
	--TypeScript Source/Notation/CodeEditorLand/Editor/tsconfig.no-types.json

Build 'CodeEditorLand/Editor/src/**/*.{css,scss,sass,less}' \
	--ESBuild Source/Variable/CodeEditorLand/Editor/ESBuild.default.ts \
	--TypeScript Source/Notation/CodeEditorLand/Editor/tsconfig.no-types.json
